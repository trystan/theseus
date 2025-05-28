import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { FluentStuff } from "../src/fluent.ts"
import { getAllPaths } from "../src/theseus.ts"

type PlanState = { number: number }

type UserState = { strings: string[] }

describe('in general', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b').from('a').to('b').do(() => {})
  sut.to('a->c').from('a').to('c').do(() => {})
  sut.to('b->c').from('b').to('c').do(() => {})

  describe('when no start is found', () => {
    it('returns nothing', () => {
      const paths = getAllPaths(sut.facts, 'NA', { number: 0 })
      assert.equal(paths.length, 0)
    })
  })

  describe('when no target is found', () => {
    it('returns nothing', () => {
      const paths = getAllPaths(sut.facts, 'a', { number: 0 }, 'z')
      assert.equal(paths.length, 0)
    })
  })

  describe('when no target is specified', () => {
    it('returns all paths from the start', () => {
      const paths = getAllPaths(sut.facts, 'a', { number: 0 })
      assert.equal(paths.length, 2)
    })
  })
  
  describe('when multiple paths are found', () => {
    it('returns them in order from shortest to longest', () => {
      const paths = getAllPaths(sut.facts, 'a', { number: 0 }, 'c')
      assert.equal(paths.length, 2)

      const pathSteps = paths.map(p => p.steps.map(s => s.name).join(', '))
      assert.equal(pathSteps[0], 'a->c')
      assert.equal(pathSteps[1], 'a->b, b->c')
    })
  })
  
  describe('when loops are found', () => {
    var sut = new FluentStuff<PlanState, UserState>()
    sut.to('a->b').from('a').to('b').do(() => {})
    sut.to('b->a').from('b').to('a').do(() => {})
    sut.to('a->c').from('a').to('c').do(() => {})
    sut.to('b->c').from('b').to('c').do(() => {})

    it('ignores them', () => {
      const paths = getAllPaths(sut.facts, 'a', { number: 0 }, 'c')
      assert.equal(paths.length, 3)

      const pathSteps = paths.map(p => p.steps.map(s => s.name).join(', '))
      assert.equal(pathSteps[0], 'a->c')
      assert.equal(pathSteps[1], 'a->b, b->c')
      assert.equal(pathSteps[2], 'a->b, b->a, a->c')
    })
  })
  
  describe('when expectations are involved', () => {
    var sut = new FluentStuff<PlanState, UserState>()
    sut.to('a->b').from('a').to('b').do(() => {})
    sut.to('b->c').from('b').to('c').do(() => {})
    sut.beforeAll().do(() => {})
    sut.before('a->b').do(() => {})
    sut.beforeExiting('b').do(() => {})
    sut.beforeEntering('b').do(() => {})
    sut.after('a->b').do(() => {})
    sut.afterEntering('b').do(() => {})
    sut.afterExiting('b').do(() => {})
    sut.afterAll().do(() => {})
    sut.finally(() => {})

    it('includes them', () => {
      const paths = getAllPaths(sut.facts, 'a', { number: 0 }, 'c')
      assert.equal(paths.length, 1)

      const pathSteps = paths[0].steps.map(s => s.name)
      assert.equal(pathSteps[0], '* before all *')
      assert.equal(pathSteps[1], 'before a->b')
      assert.equal(pathSteps[2], 'before entering b')
      assert.equal(pathSteps[3], 'a->b')
      assert.equal(pathSteps[4], 'after a->b')
      assert.equal(pathSteps[5], 'after entering b')
      assert.equal(pathSteps[6], 'before exiting b')
      assert.equal(pathSteps[7], 'b->c')
      assert.equal(pathSteps[8], 'after exiting b')
      assert.equal(pathSteps[9], '* after all *')
    })
  })
})

describe('when navigation uses planState', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b0').from('a', s => s.number === 0).to('b', s => s.number = 0).do(() => {})
  sut.to('a->b1').from('a', s => s.number === 0).to('b', s => s.number = 1).do(() => {})
  sut.to('b3->c').from('b', s => s.number === 3).to('c', s => s.number = 2).do(() => {})
  sut.to('b1->c').from('b', s => s.number === 1).to('c', s => s.number = 2).do(() => {})

  it('finds the path', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 }, 'c')
    assert.equal(paths.length, 1)
    
    const pathSteps = paths.map(p => p.steps.map(s => s.name).join(', '))
    assert.equal(pathSteps[0], 'a->b1, b1->c')
  })
})

describe('when expectations require planState', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b').from('a').to('b', s => s.number = 1).do(() => {})
  sut.to('b->c').from('b').to('c').do(() => {})
  sut.beforeAll().do(() => {})
  sut.before('a->b').do(() => {})
  sut.beforeExiting('b', s => s.number == 2).do(() => {}) // exclude: 2 != 1
  sut.beforeEntering('b', s => s.number == 0).do(() => {}) // include: 0 == 0
  sut.after('a->b', s => s.number == 1).do(() => {}) // include: 1 == 1
  sut.afterEntering('b', s => s.number == 2).do(() => {}) // exclude: 2 != 1
  sut.afterExiting('b').do(() => {}) // include: null is fine
  sut.afterAll().do(() => {})
  sut.finally(() => {})

  it('excludes ones that do not match', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 }, 'c')
    assert.equal(paths.length, 1)

    const pathSteps = paths[0].steps.map(s => s.name)
    console.log(pathSteps)
    assert.equal(pathSteps[0], '* before all *')
    assert.equal(pathSteps[1], 'before a->b')
    assert.equal(pathSteps[2], 'before entering b')
    assert.equal(pathSteps[3], 'a->b')
    assert.equal(pathSteps[4], 'after a->b')
    assert.equal(pathSteps[5], 'b->c')
    assert.equal(pathSteps[6], 'after exiting b')
    assert.equal(pathSteps[7], '* after all *')
  })
})
