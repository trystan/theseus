import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { getShortestPath, newFacts, Fluent } from "../src/index.ts"

type PlanState = { number: number }

type UserState = { strings: string[] }

const addChain = (sut: Fluent<PlanState, UserState>, states: string[]) => {
  for (let i = 0; i < states.length - 1; i++) {
    sut.to(`${states[i]}->${states[i + 1]}`).from(states[i]).to(states[i + 1]).do(() => {})
  }
}

describe('when there are no facts at all', () => {
  it('returns nothing', () => {
    const path = getShortestPath(newFacts<PlanState, UserState>(), 'a', { number: 0 })
    assert.equal(path, undefined)
  })
})

describe('when no start is found', () => {
  var sut = new Fluent<PlanState, UserState>()
  sut.to('a->b').from('a').to('b').do(() => {})

  it('returns nothing', () => {
    const path = getShortestPath(sut.facts, 'NA', { number: 0 })
    assert.equal(path, undefined)
  })
})

describe('when no target is found', () => {
  var sut = new Fluent<PlanState, UserState>()
  sut.to('a->b').from('a').to('b').do(() => {})

  it('returns nothing', () => {
    const path = getShortestPath(sut.facts, 'a', { number: 0 }, 'z')
    assert.equal(path, undefined)
  })
})

describe('when only one path exists', () => {
  var sut = new Fluent<PlanState, UserState>()
  sut.to('a->b').from('a').to('b').do(() => {})
  sut.to('b->c').from('b').to('c').do(() => {})

  it('returns it', () => {
    const path = getShortestPath(sut.facts, 'a', { number: 0 }, 'c')
    assert.deepEqual(path?.steps.map(s => s.name), ['a->b', 'b->c'])
  })
})

describe('when several paths exist', () => {
  var sut = new Fluent<PlanState, UserState>()
  sut.to('a->b').from('a').to('b').do(() => {})
  sut.to('b->c').from('b').to('c').do(() => {})
  sut.to('a->c').from('a').to('c').do(() => {})

  it('returns the one with the fewest steps', () => {
    const path = getShortestPath(sut.facts, 'a', { number: 0 }, 'c')
    assert.deepEqual(path?.steps.map(s => s.name), ['a->c'])
  })
})

describe('when no target is specified', () => {
  var sut = new Fluent<PlanState, UserState>()
  sut.to('a->b').from('a').to('b').do(() => {})
  sut.to('b->c').from('b').to('c').do(() => {})
  sut.to('a->c').from('a').to('c').do(() => {})

  it('returns the shortest path from the start', () => {
    const path = getShortestPath(sut.facts, 'a', { number: 0 })
    assert.deepEqual(path?.steps.map(s => s.name), ['a->c'])
  })
})

describe('when expectations are involved', () => {
  var sut = new Fluent<PlanState, UserState>()
  sut.to('a->c').from('a').to('c').do(() => {})
  sut.to('a->b').from('a').to('b').do(() => {})
  sut.to('b->c').from('b').to('c').do(() => {})
  sut.before('a->c').do(() => {})
  sut.after('a->c').do(() => {})

  it('counts them towards the length of the path', () => {
    const path = getShortestPath(sut.facts, 'a', { number: 0 }, 'c')
    assert.deepEqual(path?.steps.map(s => s.name), ['a->b', 'b->c'])
  })
})

describe('when navigation uses planState', () => {
  var sut = new Fluent<PlanState, UserState>()
  sut.to('a->b').from('a').to('b', s => s.number = 1).do(() => {})
  sut.to('b3->c').from('b', s => s.number === 3).to('c').do(() => {})
  sut.to('b1->c').from('b', s => s.number === 1).to('c').do(() => {})

  it('only considers navigations that match', () => {
    const path = getShortestPath(sut.facts, 'a', { number: 0 }, 'c')
    assert.deepEqual(path?.steps.map(s => s.name), ['a->b', 'b1->c'])
  })
})

describe('when finally callbacks are registered', () => {
  const always = () => {}

  var sut = new Fluent<PlanState, UserState>()
  sut.to('a->b').from('a').to('b').do(() => {})
  sut.finally(always)

  it('carries them on the path', () => {
    const path = getShortestPath(sut.facts, 'a', { number: 0 })
    assert.deepEqual(path?.finally.map(f => f.do), [always])
  })
})

describe('when one path has nine steps and another has ten', () => {
  var sut = new Fluent<PlanState, UserState>()
  addChain(sut, ['a', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 'z']) // 9 navigations
  addChain(sut, ['a', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'z']) // 10 navigations

  // Path lengths are sorted with the default comparator, which compares them as
  // strings, so '10' sorts before '9'.
  it('returns the one with nine steps', () => {
    const path = getShortestPath(sut.facts, 'a', { number: 0 }, 'z')
    assert.equal(path?.steps.length, 9)
    assert.equal(path?.steps[0].name, 'a->s1')
  })
})
