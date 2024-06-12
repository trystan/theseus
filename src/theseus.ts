export type StepFn<TUserState> = (state: TUserState) => void | Promise<any>

export interface NavigationFact<TUserState> {
  name?: string
  from: string
  to: string
  do: StepFn<TUserState>
}

export interface ExpectationFact<TUserState> {
  name?: string
  at: string
  do: StepFn<TUserState>
}

export type Fact<TUserState> = NavigationFact<TUserState> | ExpectationFact<TUserState>

export type NavPath<TUserState> = NavigationFact<TUserState>[]

export type Path<TUserState> = Fact<TUserState>[]

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

export const getAllPaths = <TUserState>(facts: Facts<TUserState>, from: string, to: string | null): NavPath<TUserState>[] => {
  const helper = (from: string, to: string | null, path: NavigationFact<TUserState>[]): NavPath<TUserState>[] => {
    if (to && path.length && path[path.length - 1].to === to) return [path]

    const nextSteps = facts.navigation.filter(f => f.from === from && !path.includes(f))
    if (nextSteps.length === 0) {
      if (path.length && (to === null || path[path.length - 1].to === to)) {
        return [path]
      } else {
        return []
      }
    } else {
      return nextSteps.flatMap(next => helper(next.to, to, [...path, next]))
    }
  }
  return helper(from, to, [])
}

export const getShortestPath = <TUserState>(facts: Facts<TUserState>, from: string, to: string | null): NavPath<TUserState> | undefined => {
  return getAllPaths(facts, from, to)
    .map<[number, NavPath<TUserState>]>(p => [p.length, p])
    .sort()
    .map(kv => kv[1])
    .shift()
}

export const describePath = <TUserState>(path: Path<TUserState>): string[] => {
  return path.map(f => {
    if (f.name) {
      return f.name
    } else if ('from' in f) {
      return `navigate from ${f.from} to ${f.to}`
    } else {
      return 'verification step'
    }
  }).filter((s): s is string => Boolean(s))
}

export const addExpectations = <TUserState>(facts: Facts<TUserState>, path: NavPath<TUserState>): Path<TUserState> => {
  const middle = path.flatMap(nav => [
    ...facts.beforeExiting.filter(e => e.at === nav.from),
    ...facts.before.filter(e => e.at === nav.name),
    ...facts.beforeEntering.filter(e => e.at === nav.to),
    nav,
    ...facts.afterExiting.filter(e => e.at === nav.from),
    ...facts.after.filter(e => e.at === nav.name),
    ...facts.afterEntering.filter(e => e.at === nav.to),
  ])
  return [
    ...facts.beforeAll,
    ...middle,
    ...facts.afterAll,
  ]
}

export const runPaths = async <TUserState>(paths: Path<TUserState>[], states: TUserState[]): Promise<void> => {
  const runPath = async <TUserState>(path: Path<TUserState>, state: TUserState): Promise<void> => {
    for (var step of path) {
      await step.do(state)
    }
  }
  const promises: Promise<any>[] = []
  for (var path of paths) {
    for (var state of states) {
      promises.push(runPath(path, state))
    }
  }
  await Promise.all(promises)
}
