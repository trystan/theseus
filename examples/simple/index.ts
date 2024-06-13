import { FluentStuff } from "../../src/fluent"
import { toGraphvizInput } from "../../src/graphviz"
import { Facts, defaultMeta } from "../../src/theseus"

interface UserState {
  log: string[]
}

const facts: Facts<UserState> = {
  navigation: [
    { from: 'a', to: 'b', name: 'first step', do: state => { state.log.push('a to b') },
      meta: defaultMeta() },
    { from: 'b', to: 'l1', do: state => { state.log.push('b to l1') },
      meta: defaultMeta() },
    { from: 'b', to: 'r1', do: state => { state.log.push('b to r1') },
      meta: defaultMeta() },
    { from: 'l1', to: 'c', do: state => { state.log.push('l1 to c') },
      meta: defaultMeta() },
    { from: 'r1', to: 'c', do: state => { state.log.push('r1 to c') },
      meta: defaultMeta() },
    { from: 'c', to: 'd', do: state => { state.log.push('c to d') },
      meta: defaultMeta() },
    { from: 'd', to: 'l2', do: state => { state.log.push('d to l2') },
      meta: defaultMeta() },
    { from: 'd', to: 'r2', do: state => { state.log.push('d to r2') },
      meta: defaultMeta() },
  ],
  beforeAll: [

  ],
  before: [
    { at: 'first step', do: state => { state.log.push('* before first step *') },
      meta: defaultMeta() },
  ],
  beforeEntering: [
    { at: 'b', do: state => { state.log.push('* before entering b *') },
      meta: defaultMeta() },
  ],
  afterExiting: [
    { at: 'b', do: state => { state.log.push('* after exiting b *') },
      meta: defaultMeta() },
  ],
  after: [
    { at: 'first step', do: state => { state.log.push('* after first step *') },
      meta: defaultMeta() },
  ],
  afterEntering: [
    { at: 'b', do: state => { state.log.push('* after entering b *') },
      meta: defaultMeta() },
  ],
  beforeExiting: [
    { at: 'b', do: state => { state.log.push('* befeore exiting b *') },
      meta: defaultMeta() },
  ],
  afterAll: [

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
.with(meta => meta.cost = 12)

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
