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

    const isNext = (f: NavigationFact<TPlanState, TUserState>) => f.from === from
    const isNotInPath = (f: NavigationFact<TPlanState, TUserState>) => !pathSoFar.some(f2 => f2 === f)
    const matchesPlanState = (f: Fact<TPlanState, TUserState> | FinallyCallback<TPlanState, TUserState>) => f.ifPlanState === undefined || f.ifPlanState(currentPlanState)

    const nextNavSteps = facts.navigation
      .filter(isNext)
      .filter(isNotInPath)
      .filter(matchesPlanState)

    const isDeadEnd = nextNavSteps.length === 0
    const hasArrived = here !== null && (to === undefined ? isDeadEnd : here.to === to)

    const pathsEndingHere: Path<TPlanState, TUserState>[] = hasArrived
      ? [{
          steps: pathSoFar.concat(facts.afterAll.filter(matchesPlanState)),
          finally: facts.finally.filter(matchesPlanState)
        }]
      : []

    const pathsCarryingOn = nextNavSteps.flatMap(nextNav => {
      const beforeExpectations = [
        ...facts.beforeExiting.filter(e => e.at === nextNav.from),
        ...facts.before.filter(e => e.at === nextNav.name),
        ...facts.beforeEntering.filter(e => e.at === nextNav.to),
      ].filter(matchesPlanState)

      const nextPlanState = nextNav.toPlanState ? structuredClone(currentPlanState) : currentPlanState

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

    return [...pathsEndingHere, ...pathsCarryingOn]
  }

  const beforeAll = facts.beforeAll.filter(f => f.ifPlanState === undefined || f.ifPlanState(initialPlanState))

  return nextStep(from, beforeAll, null, initialPlanState)
    .sort((a, b) => a.steps.length - b.steps.length)
}

export const getShortestPath = <TPlanState, TUserState>(facts: Facts<TPlanState, TUserState>, from: string, initialAppState: TPlanState, to?: string): Path<TPlanState, TUserState> | undefined => {
  return getAllPaths(facts, from, initialAppState, to)
    .map<{ length: number, path: Path<TPlanState, TUserState> }>(p => ({ length: p.steps.length, path: p }))
    .sort((a, b) => a.length - b.length)
    .map(kv => kv.path)
    .shift()
}
