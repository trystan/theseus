import { type PathLike } from "fs"
import { type Facts, type NavigationFact } from "./theseus.ts"
import { type FileHandle, writeFile } from 'fs/promises'

const describeEdge = <TPlanState, TUserState>(n: NavigationFact<TPlanState, TUserState>) => `  "${n.from}" -> "${n.to}"` + (n.name ? ` [label="${n.name}"]` : "")

export const toGraphvizInput = <TPlanState, TUserState>(facts: Facts<TPlanState, TUserState>): string => {
  return `digraph { \n${facts.navigation.map(describeEdge).join('\n') }\n}`
}

export const writeGraphvizFile = <TPlanState, TUserState>(file: PathLike | FileHandle, facts: Facts<TPlanState, TUserState>): Promise<void> => {
  const toFile = typeof file === 'string'
    ? file.endsWith('.dot') ? file : `${file}.dot`
    : file
  return writeFile(toFile, toGraphvizInput(facts))
}
