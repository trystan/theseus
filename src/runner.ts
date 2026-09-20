import { randomUUID } from "node:crypto"
import type { Fact, Path, Context } from "./core.ts"
import { DefaultOutput } from "./defaultOutput.ts";

export type StateConstructor<TUserState> = () => Promise<TUserState>

class DoubleIterator<T1, T2> {
  t1s: Array<T1>
  t2s: Array<T2>
  i1 = 0
  i2 = 0

  constructor(t1s: Array<T1>, t2s: Array<T2>) {
    this.t1s = t1s
    this.t2s = t2s
  }

  getNext = (): [T1, T2] | undefined => {
    if (this.i2 >= this.t2s.length) return undefined

    const t1 = this.t1s[this.i1]
    const t2 = this.t2s[this.i2]

    this.i1++
    if (this.i1 >= this.t1s.length) {
      this.i1 = 0
      this.i2++
    }

    return [t1, t2]
  }
}

const inParallel = (maxConcurrency: number, getNextPromise: () => Promise<void> | undefined): Promise<void> => new Promise<void>((resolve) => {
    let inProgress = 0

    const run1 = (p: Promise<void>) => {
        inProgress++
        return p.finally(() => {
            inProgress--
            const next = getNextPromise()
            if (next) {
                run1(next)
            } else if (inProgress === 0) {
                resolve()
            }
        })
    }

    while (inProgress < maxConcurrency) {
        const next = getNextPromise()
        if (next) {
            run1(next)
        } else {
            if (inProgress === 0) {
              resolve()
            }
            break
        }
    }
})

export type Output = {
  beforeAll<TPlanState, TUserState>(paths: Path<TPlanState, TUserState>[], states: StateConstructor<TUserState>[], options: { concurrency: number; }): void
  beforeRun<TPlanState, TUserState>(runId: string, path: Path<TPlanState, TUserState>): void
  afterRun<TPlanState, TUserState>(runId: string, path: Path<TPlanState, TUserState>): void
  beforeStep<TPlanState, TUserState>(runId: string, step: Fact<TPlanState, TUserState>, context: Context<TPlanState, TUserState>): void
  afterStep<TPlanState, TUserState>(runId: string, step: Fact<TPlanState, TUserState>, context: Context<TPlanState, TUserState>, error: Error | null): void
  afterAll(): void
}

class PathRunner<TPlanState, TUserState> {
  output: Output

  constructor(output: Output = new DefaultOutput()) {
    this.output = output
  }

  runStep = async (id: string, step: Fact<TPlanState, TUserState>, state: TUserState, context: Context<TPlanState, TUserState>): Promise<boolean> => {
    try {
      this.output.beforeStep(id, step, context)

      await step.do(state, context)
      
      this.output.afterStep(id, step, context, null)

      return true
    } catch (error) {
      if (error instanceof Error) {
        this.output.afterStep(id, step, context, error)
      } else {
        console.error(error)
      }

      if ('config' in step && step.config?.continueAfterError) {
        return true
      } else {
        return false
      }
    }
  }

  runPath = async (path: Path<TPlanState, TUserState>, userState: TUserState): Promise<void> => {
    const id = randomUUID()

    this.output.beforeRun(id, path)
    let keepGoing = true
    for (let index = 0; keepGoing && index < path.steps.length; index++) {
      keepGoing = await this.runStep(id, path.steps[index], userState, { path, index})
    }
    path.finally.forEach(async fn => await fn.do(userState, { path, index: -1 }))
    this.output.afterRun(id, path)
  }

  runPaths = async (paths: Path<TPlanState, TUserState>[],
                    states: StateConstructor<TUserState>[],
                    options: { concurrency: number }): Promise<void> => {

    if (options.concurrency < 1) throw Error('concurrency must be greater than zero')

    const iterator = new DoubleIterator(paths, states)

    const getNextRun = () => {
      const next = iterator.getNext()
      if (!next) return undefined
      const [nextPath, nextState] = next
      return nextState().then(s => this.runPath(nextPath, s))
    }
    
    this.output.beforeAll(paths, states, options)

    await inParallel(options.concurrency, getNextRun)

    this.output.afterAll()
  }
}

export const runPaths = async <TPlanState, TUserState>(
    paths: Path<TPlanState, TUserState>[],
    states: Array<StateConstructor<TUserState>>,
    options: { concurrency: number } = { concurrency: 1 }): Promise<void> => {
  await new PathRunner<TPlanState, TUserState>(new DefaultOutput()).runPaths(paths, states, options)
}
