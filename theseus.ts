interface NavigationFact {
  from: string
  to: string
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
  { from: 'l2', to: 'e' },
  { from: 'r2', to: 'e' },
  { from: 'l2', to: 'z1' },
  { from: 'r2', to: 'z2' },
  { from: 'e', to: 'z' },
]

const toGraphvizInput = (facts: NavigationFact[]): string => {
  const describeEdge = (n: NavigationFact) => {
    return `  "${n.from}" -> "${n.to}"`
  }
  return `digraph { \n${facts.map(describeEdge).join('\n') }\n}`
}

// -- run -- //

console.log(toGraphvizInput(facts))
