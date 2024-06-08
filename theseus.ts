interface NavigationFact<TUserState> {
  from: string
  to: string
  do: (state: TUserState) => void
}

class FluentStuff<TUserState> {
  facts: NavigationFact<TUserState>[]

  constructor(facts: NavigationFact<TUserState>[]) {
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
                facts.push({ from: fromState, to: toState, do: fn })
              }
            }
          }
        }
      }
    }
  }
}

const toGraphvizInput = <TUserState>(facts: NavigationFact<TUserState>[]): string => {
  const describeEdge = (n: NavigationFact<TUserState>) => {
    return `  "${n.from}" -> "${n.to}"`
  }
  return `digraph { \n${facts.map(describeEdge).join('\n') }\n}`
}

const getAllPaths = <TUserState>(facts: NavigationFact<TUserState>[], from: string, to: string | null): NavigationFact<TUserState>[][] => {
  const helper = (facts: NavigationFact<TUserState>[], from: string, to: string | null, path: NavigationFact<TUserState>[]): NavigationFact<TUserState>[][] => {
    if (to && path.length && path[path.length - 1].to === to) return [path]

    const nextSteps = facts.filter(f => f.from === from && !path.includes(f))
    if (nextSteps.length === 0) {
      if (path.length && (to === null || path[path.length - 1].to === to)) {
        return [path]
      } else {
        return []
      }
    } else {
      return nextSteps.flatMap(next => helper(facts, next.to, to, [...path, next]))
    }
  }
  return helper(facts, from, to, [])
}

const getShortestPath = <TUserState>(facts: NavigationFact<TUserState>[], from: string, to: string | null): NavigationFact<TUserState>[] | undefined => {
  const paths = getAllPaths(facts, from, to)
    .map<[number, NavigationFact<TUserState>[]]>(p => [p.length, p])
    .sort()
  if (paths.length) {
    return paths[0][1]
  } else {
    return undefined
  }
}

const describePath = <TUserState>(path: NavigationFact<TUserState>[]): string => {
  return path.map(f => `${f.from} -> ${f.to}`).join('\n')
}

const runPath = <TUserState>(path: NavigationFact<TUserState>[], state: TUserState): void => {
  for (const step of path) {
    step.do(state)
  }
}

// -- run -- //

interface UserState {
  log: string[]
}

const facts: NavigationFact<UserState>[] = [
  { from: 'a', to: 'b', do: state => { state.log.push('a to b') } },
  { from: 'b', to: 'l1', do: state => { state.log.push('b to l1') } },
  { from: 'b', to: 'r1', do: state => { state.log.push('b to r1') } },
  { from: 'l1', to: 'c', do: state => { state.log.push('l1 to c') } },
  { from: 'r1', to: 'c', do: state => { state.log.push('r1 to c') } },
  { from: 'c', to: 'd', do: state => { state.log.push('c to d') } },
  { from: 'd', to: 'l2', do: state => { state.log.push('d to l2') } },
  { from: 'd', to: 'r2', do: state => { state.log.push('d to r2') } },
]

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

// console.log(toGraphvizInput(facts))

// console.log(describePath(getAllPaths(facts, 'a', 'r2')[0])

// console.log(describePath(getShortestPath(facts, 'a', 'r2')!))

const state = { log: [] }
runPath(getShortestPath(facts, 'a', 'r2')!, state)
console.log(state)