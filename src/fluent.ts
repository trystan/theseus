import { Facts, Meta, StepFn, defaultMeta, newFacts } from "./theseus"

export class FluentStuff<TUserState> {
  facts: Facts<TUserState>

  constructor(existingFacts?: Facts<TUserState>) {
    this.facts = existingFacts ?? newFacts()
  }

  to(name: string) {
    const facts = this.facts
    return {
      beforeAll() {
        return {
          do(fn: StepFn<TUserState>) {
            const fact = { name, at: '* before all *', do: fn, meta: defaultMeta() }
            facts.beforeAll.push(fact)
            return {
              with(setup: (meta: Meta) => void) {
                setup(fact.meta)
              }
            }
          }
        }
      },
    
      afterAll() {
        return {
          do(fn: StepFn<TUserState>) {
            const fact = { name, at: '* after all *', do: fn, meta: defaultMeta() }
            facts.afterAll.push(fact)
            return {
              with(setup: (meta: Meta) => void) {
                setup(fact.meta)
              }
            }
          }
        }
      },
      
      from(fromState: string) {
        return {
          to(toState: string) {
            return {
              do(fn: StepFn<TUserState>) {
                const fact = { name, from: fromState, to: toState, do: fn, meta: defaultMeta() }
                facts.navigation.push(fact)
                return {
                  with(setup: (meta: Meta) => void) {
                    setup(fact.meta)
                  }
                }
              }
            }
          }
        }
      },
    
      before(navigation: string) {
        return {
          do(fn: StepFn<TUserState>) {
            const fact = { name, at: navigation, do: fn, meta: defaultMeta() }
            facts.before.push(fact)
            return {
              with(setup: (meta: Meta) => void) {
                setup(fact.meta)
              }
            }
          }
        }
      },

      beforeEntering(state: string) {
        return {
          do(fn: StepFn<TUserState>) {
            const fact = { name, at: state, do: fn, meta: defaultMeta() }
            facts.beforeEntering.push(fact)
            return {
              with(setup: (meta: Meta) => void) {
                setup(fact.meta)
              }
            }
          }
        }
      },
      
      beforeExiting(state: string) {
        return {
          do(fn: StepFn<TUserState>) {
            const fact = { name, at: state, do: fn, meta: defaultMeta() }
            facts.beforeExiting.push(fact)
            return {
              with(setup: (meta: Meta) => void) {
                setup(fact.meta)
              }
            }
          }
        }
      },
      
      after(navigation: string) {
        return {
          do(fn: StepFn<TUserState>) {
            const fact = { name, at: navigation, do: fn, meta: defaultMeta() }
            facts.after.push(fact)
            return {
              with(setup: (meta: Meta) => void) {
                setup(fact.meta)
              }
            }
          }
        }
      },

      afterEntering(state: string) {
        return {
          do(fn: StepFn<TUserState>) {
            const fact = { name, at: state, do: fn, meta: defaultMeta() }
            facts.afterEntering.push(fact)
            return {
              with(setup: (meta: Meta) => void) {
                setup(fact.meta)
              }
            }
          }
        }
      },

      afterExiting(state: string) {
        return {
          do(fn: StepFn<TUserState>) {
            const fact = { name, at: state, do: fn, meta: defaultMeta() }
            facts.afterExiting.push(fact)
            return {
              with(setup: (meta: Meta) => void) {
                setup(fact.meta)
              }
            }
          }
        }
      }
    }
  }

  toNavigate() {
    const facts = this.facts
    return {
      from(fromState: string) {
        return {
          to(toState: string) {
            return {
              do(fn: StepFn<TUserState>) {
                const fact = { from: fromState, to: toState, do: fn, meta: defaultMeta() }
                facts.navigation.push(fact)
                return {
                  with(setup: (meta: Meta) => void) {
                    setup(fact.meta)
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  beforeAll() {
    const facts = this.facts
    return {
      do(fn: StepFn<TUserState>) {
        const fact = { at: '* before all *', do: fn, meta: defaultMeta() }
        facts.beforeAll.push(fact)
        return {
          with(setup: (meta: Meta) => void) {
            setup(fact.meta)
          }
        }
      }
    }
  }

  afterAll() {
    const facts = this.facts
    return {
      do(fn: StepFn<TUserState>) {
        const fact = { at: '* after all *', do: fn, meta: defaultMeta() }
        facts.afterAll.push(fact)
        return {
          with(setup: (meta: Meta) => void) {
            setup(fact.meta)
          }
        }
      }
    }
  }
  
  before(navigation: string) {
    const facts = this.facts
    return {
      do(fn: StepFn<TUserState>) {
        const fact = { at: navigation, do: fn, meta: defaultMeta() }
        facts.before.push(fact)
        return {
          with(setup: (meta: Meta) => void) {
            setup(fact.meta)
          }
        }
      }
    }
  }

  beforeEntering(state: string) {
    const facts = this.facts
    return {
      do(fn: StepFn<TUserState>) {
        const fact = { at: state, do: fn, meta: defaultMeta() }
        facts.beforeEntering.push(fact)
        return {
          with(setup: (meta: Meta) => void) {
            setup(fact.meta)
          }
        }
      }
    }
  }
  
  beforeExiting(state: string) {
    const facts = this.facts
    return {
      do(fn: StepFn<TUserState>) {
        const fact = { at: state, do: fn, meta: defaultMeta() }
        facts.beforeExiting.push(fact)
        return {
          with(setup: (meta: Meta) => void) {
            setup(fact.meta)
          }
        }
      }
    }
  }

  after(navigation: string) {
    const facts = this.facts
    return {
      do(fn: StepFn<TUserState>) {
        const fact = { at: navigation, do: fn, meta: defaultMeta() }
        facts.after.push(fact)
        return {
          with(setup: (meta: Meta) => void) {
            setup(fact.meta)
          }
        }
      }
    }
  }
  
  afterEntering(state: string) {
    const facts = this.facts
    return {
      do(fn: StepFn<TUserState>) {
        const fact = { at: state, do: fn, meta: defaultMeta() }
        facts.afterEntering.push(fact)
        return {
          with(setup: (meta: Meta) => void) {
            setup(fact.meta)
          }
        }
      }
    }
  }

  afterExiting(state: string) {
    const facts = this.facts
    return {
      do(fn: StepFn<TUserState>) {
        const fact = { at: state, do: fn, meta: defaultMeta() }
        facts.afterExiting.push(fact)
        return {
          with(setup: (meta: Meta) => void) {
            setup(fact.meta)
          }
        }
      }
    }
  }
}
