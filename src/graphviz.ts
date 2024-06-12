import { Facts, NavigationFact, getAllPaths } from "./theseus"

export const toGraphvizInput = <TUserState>(facts: Facts<TUserState>): string => {
  const allPaths = getAllPaths<TUserState>(facts, 'a', null)
  const countOf = (n: NavigationFact<TUserState>): number => allPaths.filter(p => p.includes(n)).length
  const describeEdge = (n: NavigationFact<TUserState>) => `  "${n.from}" -> "${n.to}" [label="${countOf(n)}"]`
  return `digraph { \n${facts.navigation.map(describeEdge).join('\n') }\n}`
}
