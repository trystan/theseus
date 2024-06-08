interface NavigationFact<TUserState> {
  from: string
  to: string
  do: (state: TUserState) => void
}

interface ExpectationFact<TUserState> {
  at: string
  do: (state: TUserState) => void
}

type Fact<TUserState> = NavigationFact<TUserState> | ExpectationFact<TUserState>

interface Facts<TUserState> {
  navigation: NavigationFact<TUserState>[]
  beforeEntering: ExpectationFact<TUserState>[]
  beforeExiting: ExpectationFact<TUserState>[]
  afterEntering: ExpectationFact<TUserState>[]
  afterExiting: ExpectationFact<TUserState>[]
}

class FluentStuff<TUserState> {
  facts: Facts<TUserState>

  constructor(facts: Facts<TUserState>) {
    this.facts = facts
  }

  toNavigate() {
    const facts = this.facts
    return {
      from(fromState: string) {
        return {
          to(toState: string) {
            return {
              do(fn: (state: TUserState) => void) {
                facts.navigation.push({ from: fromState, to: toState, do: fn })
              }
            }
          }
        }
      }
    }
  }
  
  beforeEntering(state: string) {
    const facts = this.facts
    return {
      do(fn: (state: TUserState) => void) {
        facts.beforeEntering.push({ at: state, do: fn })
      }
    }
  }
  
  beforeExiting(state: string) {
    const facts = this.facts
    return {
      do(fn: (state: TUserState) => void) {
        facts.beforeExiting.push({ at: state, do: fn })
      }
    }
  }
  
  afterEntering(state: string) {
    const facts = this.facts
    return {
      do(fn: (state: TUserState) => void) {
        facts.afterEntering.push({ at: state, do: fn })
      }
    }
  }

  afterExiting(state: string) {
    const facts = this.facts
    return {
      do(fn: (state: TUserState) => void) {
        facts.afterExiting.push({ at: state, do: fn })
      }
    }
  }
}

const toGraphvizInput = <TUserState>(facts: NavigationFact<TUserState>[]): string => {
  const describeEdge = (n: NavigationFact<TUserState>) => `  "${n.from}" -> "${n.to}"`
  return `digraph { \n${facts.map(describeEdge).join('\n') }\n}`
}

const getAllPaths = <TUserState>(facts: Facts<TUserState>, from: string, to: string | null): NavigationFact<TUserState>[][] => {
  const helper = (from: string, to: string | null, path: NavigationFact<TUserState>[]): NavigationFact<TUserState>[][] => {
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

const getShortestPath = <TUserState>(facts: Facts<TUserState>, from: string, to: string | null): NavigationFact<TUserState>[] | undefined => {
  return getAllPaths(facts, from, to)
    .map<[number, NavigationFact<TUserState>[]]>(p => [p.length, p])
    .sort()
    .map(kv => kv[1])
    .shift()
}

const describePath = <TUserState>(path: NavigationFact<TUserState>[]): string => {
  return path.map(f => `${f.from} -> ${f.to}`).join('\n')
}

const runPath = <TUserState>(path: Fact<TUserState>[], state: TUserState): void => {
  path.forEach(step => step.do(state))
}

const addExpectations = <TUserState>(facts: Facts<TUserState>, path: NavigationFact<TUserState>[]): Fact<TUserState>[] => {
  return path.flatMap(nav => [
    ...facts.beforeExiting.filter(e => e.at === nav.from),
    ...facts.beforeEntering.filter(e => e.at === nav.to),
    nav,
    ...facts.afterExiting.filter(e => e.at === nav.from),
    ...facts.afterEntering.filter(e => e.at === nav.to),
  ])
}

// -- run -- //

interface UserState {
  log: string[]
}

const facts: Facts<UserState> = {
  navigation: [
    { from: 'a', to: 'b', do: state => { state.log.push('a to b') } },
    { from: 'b', to: 'l1', do: state => { state.log.push('b to l1') } },
    { from: 'b', to: 'r1', do: state => { state.log.push('b to r1') } },
    { from: 'l1', to: 'c', do: state => { state.log.push('l1 to c') } },
    { from: 'r1', to: 'c', do: state => { state.log.push('r1 to c') } },
    { from: 'c', to: 'd', do: state => { state.log.push('c to d') } },
    { from: 'd', to: 'l2', do: state => { state.log.push('d to l2') } },
    { from: 'd', to: 'r2', do: state => { state.log.push('d to r2') } },
  ],
  beforeEntering: [
    { at: 'b', do: state => { state.log.push('before entering b') }}
  ],
  afterEntering: [
    { at: 'b', do: state => { state.log.push('after entering b') }}
  ],
  beforeExiting: [
    { at: 'b', do: state => { state.log.push('befeore exiting b') }}
  ],
  afterExiting: [
    { at: 'b', do: state => { state.log.push('after exiting b') }}
  ]
}

const sut = new FluentStuff(facts)
sut.toNavigate().from('l2').to('e').do(state => {
  state.log.push('l2 to e')
})
sut.toNavigate().from('r2').to('e').do(state => {
  state.log.push('r2 to e')
})
sut.toNavigate().from('l2').to('z1').do(state => {
  state.log.push('l2 to z1')
})
sut.toNavigate().from('r2').to('z2').do(state => {
  state.log.push('r2 to z2')
})
sut.toNavigate().from('e').to('z').do(state => {
  state.log.push('e to z')
})
sut.beforeEntering('d').do(state => {
  state.log.push('before entering d')
})
sut.beforeExiting('d').do(state => {
  state.log.push('before exiting d')
})
sut.afterEntering('d').do(state => {
  state.log.push('after entering d')
})
sut.afterExiting('d').do(state => {
  state.log.push('after exiting d')
})

// console.log(toGraphvizInput(facts))

// console.log(describePath(getAllPaths(facts, 'a', 'r2')[0])

// console.log(describePath(getShortestPath(facts, 'a', 'r2')!))

const state = { log: [] }
const path = getShortestPath(facts, 'a', null)!
const fullPath = addExpectations(facts, path)
runPath(fullPath, state)
console.log(state)