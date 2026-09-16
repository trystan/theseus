import assert from 'assert/strict'
import { describe, it } from 'node:test'
import { FluentStuff } from "../src/fluent.ts"
import { getAllPaths, newFacts, describe as describeFact, type Path } from "../src/theseus.ts"

type PlanState = { number: number }

type UserState = { strings: string[] }

const stepNames = <TPlanState, TUserState>(path: Path<TPlanState, TUserState>) =>
  path.steps.map(s => s.name)

const pathNames = <TPlanState, TUserState>(paths: Path<TPlanState, TUserState>[]) =>
  paths.map(p => p.steps.map(s => s.name).join(', '))

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

describe('when there are no facts at all', () => {
  it('returns nothing', () => {
    const paths = getAllPaths(newFacts<PlanState, UserState>(), 'a', { number: 0 })
    assert.equal(paths.length, 0)
  })
})

describe('when the start and the target are the same', () => {
  describe('and there is no way back', () => {
    var sut = new FluentStuff<PlanState, UserState>()
    sut.to('a->b').from('a').to('b').do(() => {})

    it('does not return an empty path', () => {
      const paths = getAllPaths(sut.facts, 'a', { number: 0 }, 'a')
      assert.equal(paths.length, 0)
    })
  })

  describe('and there is a way back', () => {
    var sut = new FluentStuff<PlanState, UserState>()
    sut.to('a->b').from('a').to('b').do(() => {})
    sut.to('b->a').from('b').to('a').do(() => {})

    it('returns the round trip', () => {
      const paths = getAllPaths(sut.facts, 'a', { number: 0 }, 'a')
      assert.deepEqual(pathNames(paths), ['a->b, b->a'])
    })
  })
})

describe('when a navigation loops back to its own state', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->a').from('a').to('a').do(() => {})
  sut.to('a->b').from('a').to('b').do(() => {})

  it('allows the self loop once', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 }, 'b')
    assert.deepEqual(pathNames(paths), ['a->b', 'a->a, a->b'])
  })
})

describe('when two navigations connect the same pair of states', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b (1)').from('a').to('b').do(() => {})
  sut.to('a->b (2)').from('a').to('b').do(() => {})

  it('treats them as separate paths', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 }, 'b')
    assert.deepEqual(pathNames(paths), ['a->b (1)', 'a->b (2)'])
  })
})

describe('when a path would need the same navigation twice', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b').from('a').to('b').do(() => {})
  sut.to('b->a').from('b').to('a').do(() => {})

  it('uses each navigation at most once', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 })
    assert.deepEqual(pathNames(paths), ['a->b, b->a'])
  })
})

describe('when expectations make the shorter route have more steps', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->c').from('a').to('c').do(() => {})
  sut.to('a->b').from('a').to('b').do(() => {})
  sut.to('b->c').from('b').to('c').do(() => {})
  sut.before('a->c').do(() => {})
  sut.after('a->c').do(() => {})

  it('orders by total step count, not by navigation count', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 }, 'c')
    assert.deepEqual(pathNames(paths), [
      'a->b, b->c',
      'before a->c, a->c, after a->c'
    ])
  })
})

describe('when planState changes over several navigations', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b').from('a').to('b', s => s.number += 1).do(() => {})
  sut.to('b->c').from('b').to('c', s => s.number += 1).do(() => {})
  sut.to('c->d').from('c', s => s.number === 2).to('d').do(() => {})

  it('accumulates the changes along the path', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 }, 'd')
    assert.deepEqual(pathNames(paths), ['a->b, b->c, c->d'])
  })
})

describe('when sibling branches change planState differently', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b').from('a').to('b', s => s.number = 1).do(() => {})
  sut.to('a->c').from('a').to('c', s => s.number = 2).do(() => {})
  sut.to('b->d').from('b', s => s.number === 1).to('d').do(() => {})
  sut.to('c->d').from('c', s => s.number === 2).to('d').do(() => {})

  it('keeps each branch isolated', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 }, 'd')
    assert.deepEqual(pathNames(paths), ['a->b, b->d', 'a->c, c->d'])
  })
})

describe('when planState holds a nested value', () => {
  type TagPlanState = { tags: string[] }

  var sut = new FluentStuff<TagPlanState, UserState>()
  sut.to('a->b').from('a').to('b', s => s.tags.push('b')).do(() => {})
  sut.to('a->c').from('a').to('c', s => s.tags.push('c')).do(() => {})
  sut.to('b->d').from('b', s => s.tags.join() === 'b').to('d').do(() => {})
  sut.to('c->d').from('c', s => s.tags.join() === 'c').to('d').do(() => {})

  it('keeps each branch isolated', () => {
    const paths = getAllPaths(sut.facts, 'a', { tags: [] }, 'd')
    assert.deepEqual(pathNames(paths), ['a->b, b->d', 'a->c, c->d'])
  })
})

describe('when beforeAll expectations use planState', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b').from('a').to('b', s => s.number = 9).do(() => {})
  sut.to('keep').beforeAll(s => s.number === 0).do(() => {})
  sut.to('drop').beforeAll(s => s.number === 9).do(() => {})

  it('filters them against the initial planState', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 })
    assert.equal(paths.length, 1)
    assert.deepEqual(stepNames(paths[0]), ['keep', 'a->b'])
  })
})

describe('when afterAll expectations use planState', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b').from('a').to('b', s => s.number = 9).do(() => {})
  sut.to('keep').afterAll(s => s.number === 9).do(() => {})
  sut.to('drop').afterAll(s => s.number === 0).do(() => {})

  it('filters them against the final planState', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 })
    assert.equal(paths.length, 1)
    assert.deepEqual(stepNames(paths[0]), ['a->b', 'keep'])
  })
})

describe('when finally callbacks are registered', () => {
  const always = () => {}
  const whenNine = () => {}
  const whenZero = () => {}

  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b').from('a').to('b', s => s.number = 9).do(() => {})
  sut.finally(always)
  sut.finally(whenNine, s => s.number === 9)
  sut.finally(whenZero, s => s.number === 0)

  it('includes the ones matching the final planState', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 })
    assert.equal(paths.length, 1)
    assert.deepEqual(paths[0].finally.map(f => f.do), [always, whenNine])
  })
})

describe('when no finally callbacks are registered', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b').from('a').to('b').do(() => {})

  it('returns an empty list', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 })
    assert.deepEqual(paths[0].finally, [])
  })
})

describe('when expectations apply to the starting state', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b').from('a').to('b').do(() => {})
  sut.beforeExiting('a').do(() => {})
  sut.afterExiting('a').do(() => {})

  it('includes them around the first navigation', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 })
    assert.equal(paths.length, 1)
    assert.deepEqual(stepNames(paths[0]), ['before exiting a', 'a->b', 'after exiting a'])
  })
})

describe('when several expectations apply at the same point', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b').from('a').to('b').do(() => {})
  sut.to('enter 1').beforeEntering('b').do(() => {})
  sut.to('enter 2').beforeEntering('b').do(() => {})
  sut.to('enter 3').beforeEntering('b').do(() => {})

  it('keeps them in registration order', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 })
    assert.equal(paths.length, 1)
    assert.deepEqual(stepNames(paths[0]), ['enter 1', 'enter 2', 'enter 3', 'a->b'])
  })
})

describe('when a navigation has no name', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.toNavigate().from('a').to('b').do(() => {})
  sut.toNavigate().from('b').to('c').do(() => {})
  sut.beforeEntering('b').do(() => {})
  sut.before('a->b').do(() => {})

  it('applies state based expectations but not navigation based ones', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 }, 'c')
    assert.equal(paths.length, 1)
    assert.deepEqual(paths[0].steps.map(describeFact), [
      'before entering b',
      'navigate from a to b',
      'navigate from b to c'
    ])
  })
})

describe('when a fact has no usable name', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.toNavigate().from('a').to('b').do(() => {})
  sut.to('').beforeEntering('b').do(() => {})

  it('describes expectations by their state and navigations by their states', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 })
    assert.equal(paths.length, 1)
    assert.deepEqual(paths[0].steps.map(describeFact), ['b', 'navigate from a to b'])
  })
})

describe('when the target still has unused navigations', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b').from('a').to('b').do(() => {})
  sut.to('b->c').from('b').to('c').do(() => {})

  it('returns the path that stops at the target', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 }, 'b')
    assert.deepEqual(pathNames(paths), ['a->b'])
  })
})

describe('when every route to the target carries on past it', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b').from('a').to('b').do(() => {})
  sut.to('b->c').from('b').to('c').do(() => {})
  sut.to('c->b').from('c').to('b').do(() => {})

  it('still finds the target', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 }, 'c')
    assert.deepEqual(pathNames(paths), ['a->b, b->c'])
  })
})

describe('when no start is found but beforeAll expectations exist', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b').from('a').to('b').do(() => {})
  sut.beforeAll().do(() => {})
  sut.afterAll().do(() => {})

  it('returns nothing', () => {
    const paths = getAllPaths(sut.facts, 'NA', { number: 0 })
    assert.equal(paths.length, 0)
  })
})

describe('when planState excludes every navigation out of the start', () => {
  var sut = new FluentStuff<PlanState, UserState>()
  sut.to('a->b').from('a', s => s.number === 99).to('b').do(() => {})
  sut.beforeAll().do(() => {})

  it('returns nothing', () => {
    const paths = getAllPaths(sut.facts, 'a', { number: 0 })
    assert.equal(paths.length, 0)
  })
})
