import { FluentStuff } from "../../src/fluent"
import { toGraphvizInput } from "../../src/graphviz"
import { Facts } from "../../src/theseus"

interface UserState {
  log: string[]
}

const facts: Facts<UserState> = {
  navigation: [
    { from: 'a', to: 'b', name: 'first step', do: state => { state.log.push('a to b') } },
    { from: 'b', to: 'l1', do: state => { state.log.push('b to l1') } },
    { from: 'b', to: 'r1', do: state => { state.log.push('b to r1') } },
    { from: 'l1', to: 'c', do: state => { state.log.push('l1 to c') } },
    { from: 'r1', to: 'c', do: state => { state.log.push('r1 to c') } },
    { from: 'c', to: 'd', do: state => { state.log.push('c to d') } },
    { from: 'd', to: 'l2', do: state => { state.log.push('d to l2') } },
    { from: 'd', to: 'r2', do: state => { state.log.push('d to r2') } },
  ],
  before: [
    { at: 'first step', do: state => { state.log.push('* before first step *') }}
  ],
  beforeEntering: [
    { at: 'b', do: state => { state.log.push('* before entering b *') }}
  ],
  afterExiting: [
    { at: 'b', do: state => { state.log.push('* after exiting b *') }}
  ],
  after: [
    { at: 'first step', do: state => { state.log.push('* after first step *') }}
  ],
  afterEntering: [
    { at: 'b', do: state => { state.log.push('* after entering b *') }}
  ],
  beforeExiting: [
    { at: 'b', do: state => { state.log.push('* befeore exiting b *') }}
  ],
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
sut.to('reach the end').from('e').to('z').do(state => {
  state.log.push('e to z')
})
sut.to('validate precondition').beforeEntering('d').do(state => {
  state.log.push('* before entering d *')
})
sut.to('validate postcondition').beforeExiting('d').do(state => {
  state.log.push('* before exiting d *')
})
sut.afterEntering('d').do(state => {
  state.log.push('* after entering d *')
})
sut.afterExiting('d').do(state => {
  state.log.push('* after exiting d *')
})
sut.before('reach the end').do(state => {
  state.log.push('* before end *')
})
sut.to('verify after ending').after('reach the end').do(state => {
  state.log.push('* after end *')
})

console.log(toGraphvizInput(facts))

// console.log(describePath(getAllPaths(facts, 'a', 'r2')[0])

// console.log(describePath(getShortestPath(facts, 'a', 'r2')!))

// const state = { log: [] }
// const path = getShortestPath(facts, 'a', 'z')!
// const fullPath = addExpectations(facts, path)
// runPath(fullPath, state)
// console.log(describePath(fullPath))
// console.log(state)
