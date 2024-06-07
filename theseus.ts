interface NavigationFact {
  from: string
  to: string
  do: () => void
}

class FluentStuff {
  facts: NavigationFact[]

  constructor(facts: NavigationFact[]) {
    this.facts = facts
  }

  toNavigate() {
    const facts = this.facts
    return {
      from(fromState: string) {
        return {
          to(toState: string) {
            return {
              do(fn: () => void) {
                facts.push({ from: fromState, to: toState, do: fn })
              }
            }
          }
        }
      }
    }
  }
}

const toGraphvizInput = (facts: NavigationFact[]): string => {
  const describeEdge = (n: NavigationFact) => {
    return `  "${n.from}" -> "${n.to}"`
  }
  return `digraph { \n${facts.map(describeEdge).join('\n') }\n}`
}

const getAllPathsFrom = (facts: NavigationFact[], from: string, path: NavigationFact[] = []): NavigationFact[][] => {
  const nextSteps = facts.filter(f => f.from === from && !path.includes(f))
  if (nextSteps.length === 0) {
    if (path.length) {
      return [path]
    } else {
      return []
    }
  } else {
    return nextSteps.flatMap(next => getAllPathsFrom(facts, next.to, [...path, next]))
  }
}

const describePath = (path: NavigationFact[]): string => {
  return path.map(f => `${f.from} -> ${f.to}`).join('\n')
}

// -- run -- //

const facts: NavigationFact[] = [
  { from: 'a', to: 'b', do: () => { } },
  { from: 'b', to: 'l1', do: () => { } },
  { from: 'b', to: 'r1', do: () => { } },
  { from: 'l1', to: 'c', do: () => { } },
  { from: 'r1', to: 'c', do: () => { } },
  { from: 'c', to: 'd', do: () => { } },
  { from: 'd', to: 'l2', do: () => { } },
  { from: 'd', to: 'r2', do: () => { } },
]

const sut = new FluentStuff(facts)
sut.toNavigate().from('l2').to('e').do(() => { })
sut.toNavigate().from('r2').to('e').do(() => { })
sut.toNavigate().from('l2').to('z1').do(() => { })
sut.toNavigate().from('r2').to('z2').do(() => { })
sut.toNavigate().from('e').to('z').do(() => { })

// console.log(toGraphvizInput(facts))

console.log(describePath(getAllPathsFrom(facts, 'a')[0]))
