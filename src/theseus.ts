import { randomUUID } from "node:crypto"

export type Context<TPlanState, TUserState> = { path: Path<TPlanState, TUserState>, index: number }

export type StepFn<TPlanState, TUserState> = (state: TUserState, context: Context<TPlanState, TUserState>) => void | Promise<any>

export type NavigationFact<TPlanState, TUserState> = {
  name?: string
  from: string
  ifPlanState?: (state: TPlanState) => boolean
  to: string
  toPlanState?: (state: TPlanState) => void
  do: StepFn<TPlanState, TUserState>
}

export type ExpectationConfig = { continueAfterError: boolean }

export type ExpectationFact<TPlanState, TUserState> = {
  name?: string
  at: string
  ifPlanState?: (state: TPlanState) => boolean
  do: StepFn<TPlanState, TUserState>
  config?: ExpectationConfig
}

export type FinallyCallback<TPlanState, TUserState> = {
  do: StepFn<TPlanState, TUserState>
  ifPlanState?: (state: TPlanState) => boolean
}

export type Fact<TPlanState, TUserState> = NavigationFact<TPlanState, TUserState> | ExpectationFact<TPlanState, TUserState>

export const describe = <TPlanState, TUserState>(fact: Fact<TPlanState, TUserState>): string => {
  if (fact.name) return fact.name
  if ('at' in fact) return fact.at
  return `navigate from ${fact.from} to ${fact.to}`
}

export type Path<TPlanState, TUserState> = {
  steps: Fact<TPlanState, TUserState>[]
  finally: FinallyCallback<TPlanState, TUserState>[]
}

export interface Facts<TPlanState, TUserState> {
  navigation: NavigationFact<TPlanState, TUserState>[]
  beforeAll: ExpectationFact<TPlanState, TUserState>[]
  before: ExpectationFact<TPlanState, TUserState>[]
  beforeEntering: ExpectationFact<TPlanState, TUserState>[]
  beforeExiting: ExpectationFact<TPlanState, TUserState>[]
  after: ExpectationFact<TPlanState, TUserState>[]
  afterEntering: ExpectationFact<TPlanState, TUserState>[]
  afterExiting: ExpectationFact<TPlanState, TUserState>[]
  afterAll: ExpectationFact<TPlanState, TUserState>[]
  finally: FinallyCallback<TPlanState, TUserState>[]
}

export const newFacts = <TPlanState, TUserState>(): Facts<TPlanState, TUserState> => ({
  navigation: [],
  beforeAll: [],
  before: [],
  beforeEntering: [],
  beforeExiting: [],
  after: [],
  afterEntering: [],
  afterExiting: [],
  afterAll: [],
  finally: []
})

// TODO: remove small paths that are part of larger paths
export const getAllPaths = <TPlanState, TUserState>(
    facts: Facts<TPlanState, TUserState>, 
    from: string, 
    initialPlanState: TPlanState, 
    to?: string): Path<TPlanState, TUserState>[] => {

  const nextStep = (
      from: string, 
      pathSoFar: Fact<TPlanState, TUserState>[],
      here: NavigationFact<TPlanState, TUserState> | null,
      currentPlanState: TPlanState): Path<TPlanState, TUserState>[] => {

    const matchesPlanState = (f: Fact<TPlanState, TUserState> | FinallyCallback<TPlanState, TUserState>) => f.ifPlanState === undefined || f.ifPlanState(currentPlanState)

    const nextNavSteps = facts.navigation
      .filter(f => f.from === from && !pathSoFar.some(f2 => f2 === f))
      .filter(matchesPlanState)

    if (nextNavSteps.length === 0) {
      if (pathSoFar.length && (to === undefined || here && here.to === to)) {
        const afterAll = facts.afterAll.filter(matchesPlanState)
        const finallyFacts = facts.finally.filter(matchesPlanState)
        return [{
          steps: pathSoFar.concat(afterAll),
          finally: finallyFacts
        }]
      } else {
        return []
      }
    } else {
      return nextNavSteps.flatMap(nextNav => {
        const beforeExpectations = [
          ...facts.beforeExiting.filter(e => e.at === nextNav.from),
          ...facts.before.filter(e => e.at === nextNav.name),
          ...facts.beforeEntering.filter(e => e.at === nextNav.to),
        ].filter(matchesPlanState)

        const nextPlanState = { ...currentPlanState }

        if (nextNav.toPlanState) {
          nextNav.toPlanState(nextPlanState);
        }

        const afterExpectations = [
          ...facts.afterExiting.filter(e => e.at === nextNav.from),
          ...facts.after.filter(e => e.at === nextNav.name),
          ...facts.afterEntering.filter(e => e.at === nextNav.to),
        ].filter(f => f.ifPlanState === undefined || f.ifPlanState(nextPlanState))

        return nextStep(nextNav.to, [...pathSoFar, ...beforeExpectations, nextNav, ...afterExpectations], nextNav, nextPlanState)
      })
    }
  }

  const beforeAll = facts.beforeAll.filter(f => f.ifPlanState === undefined || f.ifPlanState(initialPlanState))

  return nextStep(from, beforeAll, null, initialPlanState)
    .sort((a, b) => a.steps.length - b.steps.length)
}

export const getShortestPath = <TPlanState, TUserState>(facts: Facts<TPlanState, TUserState>, from: string, initialAppState: TPlanState, to?: string): Path<TPlanState, TUserState> | undefined => {
  return getAllPaths(facts, from, initialAppState, to)
    .map<[number, Path<TPlanState, TUserState>]>(p => [p.steps.length, p])
    .sort()
    .map(kv => kv[1])
    .shift()
}

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

class Output {
  failureLogs: { name: string, context: Context<any, any>, error: Error }[] = []
  startTime = new Date(0)
  endTime = new Date(0)
  runStartTimes = new Map<string, Date>()
  stepStartTimes = new Map<string, Date>()

  formatTime = (totalMs: number) => {
    const totalS = totalMs / 1000
    const totalM = totalS / 60
    const totalH = totalM / 60
    return totalH > 1 ? totalH.toFixed(2) + ' hours'
         : totalM > 1 ? totalM.toFixed(2) + ' minutes'
         : totalS > 1 ? totalS.toFixed(2) + ' seconds'
         : totalMs + ' milliseconds'
  }

  beforeAll = <TPlanState, TUserState>(
      paths: Path<TPlanState, TUserState>[],
      states: StateConstructor<TUserState>[],
      options: { concurrency: number }) => {
    console.log(`== starting ${paths.length * states.length} runs, ${options.concurrency} at a time ==`)
    this.startTime = new Date()
  }

  afterAll = (stats: RunStats) => {
    this.endTime = new Date()
    const totalMs = this.endTime.getTime() - this.startTime.getTime()

    console.log()
    console.log(`Completed ${stats.successCount + stats.failureCount} steps in \x1b[33m${this.formatTime(totalMs)}\x1b[0m`)
    console.log(`  Start ${this.startTime}`)
    console.log(`  End   ${this.endTime}`)
    console.log()

    if (this.failureLogs.length) {
      const groups = new Map<string, { log: typeof this.failureLogs[number], count: number }>()
      for (const log of this.failureLogs) {
        const key = log.name + '|' + log.error.message
        const group = groups.get(key)
        if (group) {
          group.count++
        } else {
          groups.set(key, { log, count: 1 })
        }
      }
      
      console.log(`Found \x1b[31m${groups.size}\x1b[0m unique failure${groups.size === 1 ? '' : 's'}, \x1b[31m${this.failureLogs.length}\x1b[0m total:`)
      for (const group of groups.values()) {
        const error = group.log.error.toString().replace(/\n+/g, '\n').split('\n').map(l => '  ' + l).join('\n')
        console.log(`Step "${group.log.name}" \x1b[33mx${group.count}\x1b[0m` + '\n' + error + '\n')
      }
    } else {
      console.log(`Found \x1b[32m0\x1b[0m failures!`)
    }
  }
  
  beforeRun = <TPlanState, TUserState>(runId: string, path: Path<TPlanState, TUserState>, state: TUserState) => {
    this.runStartTimes.set(runId, new Date())
  }

  afterRun = <TPlanState, TUserState>(runId: string, path: Path<TPlanState, TUserState>, state: TUserState) => {
    const totalMs = new Date().getTime() - this.runStartTimes.get(runId)!.getTime()
    console.log(`Finished this run in \x1b[33m${this.formatTime(totalMs)}\x1b[0m`)
  }
  
  beforeStep = <TPlanState, TUserState>(runId: string, step: Fact<TPlanState, TUserState>, state: TUserState, context: Context<TPlanState, TUserState>) => {
    process.stdout.write(describe(step))
    this.stepStartTimes.set(runId, new Date())
  }

  afterStep = <TPlanState, TUserState>(runId: string, step: Fact<TPlanState, TUserState>, state: TUserState, context: Context<TPlanState, TUserState>, error: Error | null) => {
    const totalMs = new Date().getTime() - this.stepStartTimes.get(runId)!.getTime()
    if (totalMs > 1000) {
      process.stdout.write(` \x1b[33m[${this.formatTime(totalMs)}]\x1b[0m`)
    }

    if (error) {
      this.failureLogs.push({ name: describe(step), context, error })
      process.stdout.write(` \x1b[31m*FAIL*\x1b[0m\n    ${error}\n\n`)
    } else {
      process.stdout.write(` \x1b[32m*OK*\x1b[0m\n`)
    }
  }
}

export type RunStats = {
  durations: number[],
  successCount: number,
  failureCount: number,
}

class PathRunner<TPlanState, TUserState> {
  stats: RunStats = { durations: [], successCount: 0, failureCount: 0 }
  output: Output

  constructor(output: Output) {
    this.output = output
  }

  runStep = async (id: string, step: Fact<TPlanState, TUserState>, state: TUserState, context: Context<TPlanState, TUserState>): Promise<boolean> => {
    try {
      this.output.beforeStep(id, step, state, context)

      await step.do(state, context)
      
      this.output.afterStep(id, step, state, context, null)

      this.stats.successCount++

      return true
    } catch (error) {
      this.output.afterStep(id, step, state, context, error)

      this.stats.failureCount++

      if ('config' in step && step.config?.continueAfterError) {
        return true
      } else {
        return false
      }
    }
  }

  runPath = async (path: Path<TPlanState, TUserState>, userState: TUserState): Promise<void> => {
    const id = randomUUID()

    this.output.beforeRun(id, path, userState)
    let keepGoing = true
    for (let index = 0; keepGoing && index < path.steps.length; index++) {
      keepGoing = await this.runStep(id, path.steps[index], userState, { path, index})
    }
    path.finally.forEach(async fn => await fn.do(userState, { path, index: -1 }))
    this.output.afterRun(id, path, userState)
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

    this.output.afterAll(this.stats)
  }
}

export const runPaths = async <TPlanState, TUserState>(
    paths: Path<TPlanState, TUserState>[],
    states: Array<StateConstructor<TUserState>>,
    options: { concurrency: number } = { concurrency: 1 }): Promise<void> => {
  await new PathRunner<TPlanState, TUserState>(new Output()).runPaths(paths, states, options)
}
