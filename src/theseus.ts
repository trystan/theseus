export interface NavigationFact<TUserState> {
  name?: string
  from: string
  to: string
  do: (state: TUserState) => void
}

export interface ExpectationFact<TUserState> {
  name?: string
  at: string
  do: (state: TUserState) => void
}

export type Fact<TUserState> = NavigationFact<TUserState> | ExpectationFact<TUserState>

export type NavPath<TUserState> = NavigationFact<TUserState>[]

export type Path<TUserState> = Fact<TUserState>[]

export interface Facts<TUserState> {
  navigation: NavigationFact<TUserState>[]
  before: ExpectationFact<TUserState>[]
  beforeEntering: ExpectationFact<TUserState>[]
  beforeExiting: ExpectationFact<TUserState>[]
  after: ExpectationFact<TUserState>[]
  afterEntering: ExpectationFact<TUserState>[]
  afterExiting: ExpectationFact<TUserState>[]
}

export const toGraphvizInput = <TUserState>(facts: NavigationFact<TUserState>[]): string => {
  const describeEdge = (n: NavigationFact<TUserState>) => `  "${n.from}" -> "${n.to}"`
  return `digraph { \n${facts.map(describeEdge).join('\n') }\n}`
}

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

export const describePath = <TUserState>(path: Path<TUserState>): string => {
  return path.map(f => {
    if (f.name) {
      return f.name
    } else if ('from' in f) {
      return `navigate from ${f.from} to ${f.to}`
    } else {
      return null
    }
  }).filter(s => s).join('\n')
}

export const addExpectations = <TUserState>(facts: Facts<TUserState>, path: NavPath<TUserState>): Path<TUserState> => {
  return path.flatMap(nav => [
    ...facts.beforeExiting.filter(e => e.at === nav.from),
    ...facts.before.filter(e => e.at === nav.name),
    ...facts.beforeEntering.filter(e => e.at === nav.to),
    nav,
    ...facts.afterExiting.filter(e => e.at === nav.from),
    ...facts.after.filter(e => e.at === nav.name),
    ...facts.afterEntering.filter(e => e.at === nav.to),
  ])
}

export const runPath = <TUserState>(path: Fact<TUserState>[], state: TUserState): void => {
  path.forEach(step => step.do(state))
}