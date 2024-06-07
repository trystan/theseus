interface NavigationFact {
  from: string
  to: string
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
            facts.push({ from: fromState, to: toState})
          }
        }
      }
    }
  }
}

const facts: NavigationFact[] = [
  { from: 'a', to: 'b' },
  { from: 'b', to: 'l1' },
  { from: 'b', to: 'r1' },
  { from: 'l1', to: 'c' },
  { from: 'r1', to: 'c' },
  { from: 'c', to: 'd' },
  { from: 'd', to: 'l2' },
  { from: 'd', to: 'r2' },
]

const sut = new FluentStuff(facts)
sut.toNavigate().from('l2').to('e')
sut.toNavigate().from('r2').to('e')
sut.toNavigate().from('l2').to('z1')
sut.toNavigate().from('r2').to('z2')
sut.toNavigate().from('e').to('z')

const toGraphvizInput = (facts: NavigationFact[]): string => {
  const describeEdge = (n: NavigationFact) => {
    return `  "${n.from}" -> "${n.to}"`
  }
  return `digraph { \n${facts.map(describeEdge).join('\n') }\n}`
}

// -- run -- //

console.log(toGraphvizInput(facts))
