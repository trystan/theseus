import { setHeapSnapshotNearHeapLimit } from "v8"

export type Context<TUserState> = { path: Path<TUserState>, index: number }

export type StepFn<TUserState> = (state: TUserState, context: Context<TUserState> ) => void | Promise<any>

export type Meta = { cost: number, maximumOccurances: number }

export const defaultMeta = (): Meta => ({ cost: 1, maximumOccurances: 1 })

export interface NavigationFact<TUserState> {
  name?: string
  from: string
  to: string
  do: StepFn<TUserState>
  meta: Meta
}

export interface ExpectationFact<TUserState> {
  name?: string
  at: string
  do: StepFn<TUserState>
  meta: Meta
}

export type Fact<TUserState> = NavigationFact<TUserState> | ExpectationFact<TUserState>

export const describe = <TUserState>(fact: Fact<TUserState>): string => {
  if (fact.name) return fact.name

  if ('at' in fact) {
    return fact.at
  } else {
    return `navigate from ${fact.from} to ${fact.to}`
  }
}

export type Path<TUserState> = {
  totalCost: number
  steps: Fact<TUserState>[]
}

export interface Facts<TUserState> {
  navigation: NavigationFact<TUserState>[]
  beforeAll: ExpectationFact<TUserState>[]
  before: ExpectationFact<TUserState>[]
  beforeEntering: ExpectationFact<TUserState>[]
  beforeExiting: ExpectationFact<TUserState>[]
  after: ExpectationFact<TUserState>[]
  afterEntering: ExpectationFact<TUserState>[]
  afterExiting: ExpectationFact<TUserState>[]
  afterAll: ExpectationFact<TUserState>[]
}

export const newFacts = <TUserState>(): Facts<TUserState> => ({
  navigation: [],
  beforeAll: [],
  before: [],
  beforeEntering: [],
  beforeExiting: [],
  after: [],
  afterEntering: [],
  afterExiting: [],
  afterAll: []
})

export const getAllPaths = <TUserState>(facts: Facts<TUserState>, from: string, to: string | null): Path<TUserState>[] => {
  const helper = (from: string, path: NavigationFact<TUserState>[]): Path<TUserState>[] => {
    if (to && path.length && path[path.length - 1].to === to) return [toPath(facts, path)]

    const nextSteps = facts.navigation
      .filter(f => f.from === from)
      .filter(f => path.filter(f2 => f2 === f).length < f.meta.maximumOccurances)

    if (nextSteps.length === 0) {
      if (path.length && (to === null || path[path.length - 1].to === to)) {
        return [toPath(facts, path)]
      } else {
        return []
      }
    } else {
      return nextSteps.flatMap(next => helper(next.to, [...path, next]))
    }
  }
  return helper(from, [])
}

export const getShortestPath = <TUserState>(facts: Facts<TUserState>, from: string, to: string | null): Path<TUserState> | undefined => {
  return getAllPaths(facts, from, to)
    .map<[number, Path<TUserState>]>(p => [p.totalCost, p])
    .sort()
    .map(kv => kv[1])
    .shift()
}

const toPath = <TUserState>(facts: Facts<TUserState>, path: NavigationFact<TUserState>[]): Path<TUserState> => {
  const middle = path.flatMap(nav => [
    ...facts.beforeExiting.filter(e => e.at === nav.from),
    ...facts.before.filter(e => e.at === nav.name),
    ...facts.beforeEntering.filter(e => e.at === nav.to),
    nav,
    ...facts.afterExiting.filter(e => e.at === nav.from),
    ...facts.after.filter(e => e.at === nav.name),
    ...facts.afterEntering.filter(e => e.at === nav.to),
  ])
  const steps = [
    ...facts.beforeAll,
    ...middle,
    ...facts.afterAll,
  ]
  return {
    totalCost: steps.length,
    steps
  }
}

export type StateConstructor<TUserState> = () => (TUserState | Promise<TUserState>)

class PathRunner<TUserState> {
  stats: { durations: number[], successes: number, fails: number } = { durations: [], successes: 0, fails: 0 }

  async runPath(path: Path<TUserState>, state: TUserState): Promise<void> {
    let keepGoing = true
    for (let index = 0; keepGoing && index < path.steps.length; index++) {
      const step = path.steps[index]
      const before = Date.now()

      try {
        process.stdout.write(describe(step))

        await step.do(state, { path, index })
        
        const duration = (Date.now() - before) / 1000
        this.stats.durations.push(duration)
        if (duration > 1) {
          process.stdout.write(` [${duration.toFixed(2)}s]`)
        }
        process.stdout.write(` *OK*\n`)
        this.stats.successes++
      } catch (e) {
        const duration = (Date.now() - before) / 1000
        this.stats.durations.push(duration)
        if (duration > 1) {
          process.stdout.write(` [${duration.toFixed(2)}s]`)
        }
        process.stdout.write(` *FAIL*\n    ${e}\n\n`)
        this.stats.fails++
        keepGoing = false

        for (var afterAllIndex = index + 1; afterAllIndex < path.steps.length; afterAllIndex++) {
          const otherStep = path.steps[afterAllIndex]
          if ('at' in otherStep && otherStep.at === '* after all *') {
            process.stdout.write(` == cleanup: ${describe(otherStep)}\n`)
            await otherStep.do(state, { path, index: afterAllIndex })
          }
        }
      }
    }
  }

  async runPaths(
      paths: Path<TUserState>[],
      states: Array<StateConstructor<TUserState>>,
      options: { concurrency: number }): Promise<void> {

    process.on('SIGTERM', () => console.log('* SIGTERM *'))

    console.log({ total: paths.length * states.length, paths: paths.length, states: states.length })
    
    if (options.concurrency < 1) throw Error('concurrency must be greater than zero')

    const runPromises: Promise<any>[] = []
    let isRunning = true
    let pathIndex = -1
    let thisPath: Path<TUserState> | null = null
    let stateIndex = 0
    let thisStateConstructor: StateConstructor<TUserState> = states[stateIndex]
    const addOne = async (): Promise<boolean> =>  {
      pathIndex = pathIndex + 1
      if (pathIndex >= paths.length) {
        pathIndex = 0
        stateIndex = stateIndex + 1
        if (stateIndex >= states.length) {
          isRunning = false
          return false
        }
        thisStateConstructor = states[stateIndex]
      }
      thisPath = paths[pathIndex]
      const nextPath = thisPath
      Promise.resolve(thisStateConstructor())
        .then(nextState => {
          runPromises.push(this.runPath(nextPath, nextState)
            .then(() => {
              if (isRunning) {
                addOne()
              }
            }))
        })
      return true
    }

    for (var i = 0; i < options.concurrency; i++) {
      await addOne();
    }
    
    const runPromise = new Promise<void>(async (resolve, reject) => {
      const timer = setInterval(async () => {
        if (isRunning) return
        clearInterval(timer)
            
        await Promise.all(runPromises)
        
        console.log(this.stats)
        
        resolve()
      }, 100)
    })

    return runPromise
  }
}

export const runPaths = async <TUserState>(
    paths: Path<TUserState>[],
    states: Array<StateConstructor<TUserState>>,
    options: { concurrency: number } = { concurrency: 1 }): Promise<void> => {
  await new PathRunner<TUserState>().runPaths(paths, states, options)
}
