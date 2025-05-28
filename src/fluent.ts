import { type ExpectationConfig, type Facts, type StepFn, newFacts } from "./theseus.ts"

const defaultExpectationConfig = (): ExpectationConfig => ({ continueAfterError: false })

export class FluentStuff<TPlanState, TUserState> {
  facts: Facts<TPlanState, TUserState>

  constructor(existingFacts?: Facts<TPlanState, TUserState>) {
    this.facts = existingFacts ?? newFacts()
  }

  to(name: string) {
    const facts = this.facts
    return {
      beforeAll(ifPlanState?: (state: TPlanState) => boolean) {
        return {
          do(fn: StepFn<TPlanState, TUserState>, toPlanState?: (state: TPlanState) => void) {
            const fact = { name, at: '* before all *', ifPlanState, do: fn, config: defaultExpectationConfig() }
            facts.beforeAll.push(fact)
            return {
              with(config: (config: ExpectationConfig) => void) {
                config(fact.config)
              }
            }
          }
        }
      },
    
      afterAll(ifPlanState?: (state: TPlanState) => boolean) {
        return {
          do(fn: StepFn<TPlanState, TUserState>, toPlanState?: (state: TPlanState) => void) {
            const fact = { name, at: '* after all *', ifPlanState, do: fn, config: defaultExpectationConfig() }
            facts.afterAll.push(fact)
            return {
              with(config: (config: ExpectationConfig) => void) {
                config(fact.config)
              }
            }
          }
        }
      },
      
      from(from: string, ifPlanState?: (state: TPlanState) => boolean) {
        return {
          to(to: string, toPlanState?: (state: TPlanState) => void) {
            return {
              do(fn: StepFn<TPlanState, TUserState>) {
                const fact = { name, from, ifPlanState, to, toPlanState, do: fn }
                facts.navigation.push(fact)
              }
            }
          }
        }
      },
    
      before(navigation: string, ifPlanState?: (state: TPlanState) => boolean) {
        return {
          do(fn: StepFn<TPlanState, TUserState>, toPlanState?: (state: TPlanState) => void) {
            const fact = { name, at: navigation, ifPlanState, do: fn, config: defaultExpectationConfig() }
            facts.before.push(fact)
            return {
              with(config: (config: ExpectationConfig) => void) {
                config(fact.config)
              }
            }
          }
        }
      },

      beforeEntering(state: string, ifPlanState?: (state: TPlanState) => boolean) {
        return {
          do(fn: StepFn<TPlanState, TUserState>, toPlanState?: (state: TPlanState) => void) {
            const fact = { name, at: state, ifPlanState, do: fn, config: defaultExpectationConfig() }
            facts.beforeEntering.push(fact)
            return {
              with(config: (config: ExpectationConfig) => void) {
                config(fact.config)
              }
            }
          }
        }
      },
      
      beforeExiting(state: string, ifPlanState?: (state: TPlanState) => boolean) {
        return {
          do(fn: StepFn<TPlanState, TUserState>, toPlanState?: (state: TPlanState) => void) {
            const fact = { name, at: state, ifPlanState, do: fn, config: defaultExpectationConfig() }
            facts.beforeExiting.push(fact)
            return {
              with(config: (config: ExpectationConfig) => void) {
                config(fact.config)
              }
            }
          }
        }
      },
      
      after(navigation: string, ifPlanState?: (state: TPlanState) => boolean) {
        return {
          do(fn: StepFn<TPlanState, TUserState>, toPlanState?: (state: TPlanState) => void) {
            const fact = { name, at: navigation, ifPlanState, do: fn, config: defaultExpectationConfig() }
            facts.after.push(fact)
            return {
              with(config: (config: ExpectationConfig) => void) {
                config(fact.config)
              }
            }
          }
        }
      },

      afterEntering(state: string, ifPlanState?: (state: TPlanState) => boolean) {
        return {
          do(fn: StepFn<TPlanState, TUserState>, toPlanState?: (state: TPlanState) => void) {
            const fact = { name, at: state, ifPlanState, do: fn, config: defaultExpectationConfig() }
            facts.afterEntering.push(fact)
            return {
              with(config: (config: ExpectationConfig) => void) {
                config(fact.config)
              }
            }
          }
        }
      },

      afterExiting(state: string, ifPlanState?: (state: TPlanState) => boolean) {
        return {
          do(fn: StepFn<TPlanState, TUserState>, toPlanState?: (state: TPlanState) => void) {
            const fact = { name, at: state, ifPlanState, do: fn, config: defaultExpectationConfig() }
            facts.afterExiting.push(fact)
            return {
              with(config: (config: ExpectationConfig) => void) {
                config(fact.config)
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
      from(from: string, ifPlanState?: (state: TPlanState) => boolean) {
        return {
          to(to: string, toPlanState?: (state: TPlanState) => void) {
            return {
              do(fn: StepFn<TPlanState, TUserState>) {
                const fact = { from, ifPlanState, to, toPlanState, do: fn }
                facts.navigation.push(fact)
              }
            }
          }
        }
      }
    }
  }

  beforeAll(ifPlanState?: (state: TPlanState) => boolean) {
    const facts = this.facts
    return {
      do(fn: StepFn<TPlanState, TUserState>, toPlanState?: (state: TPlanState) => void) {
        const fact = { name: '* before all *', at: '* before all *', ifPlanState, do: fn, config: defaultExpectationConfig() }
        facts.beforeAll.push(fact)
        return {
          with(config: (config: ExpectationConfig) => void) {
            config(fact.config)
          }
        }
      }
    }
  }

  afterAll(ifPlanState?: (state: TPlanState) => boolean) {
    const facts = this.facts
    return {
      do(fn: StepFn<TPlanState, TUserState>, toPlanState?: (state: TPlanState) => void) {
        const fact = { name: '* after all *', at: '* after all *', ifPlanState, do: fn, config: defaultExpectationConfig() }
        facts.afterAll.push(fact)
        return {
          with(config: (config: ExpectationConfig) => void) {
            config(fact.config)
          }
        }
      }
    }
  }
  
  before(navigation: string, ifPlanState?: (state: TPlanState) => boolean) {
    const facts = this.facts
    return {
      do(fn: StepFn<TPlanState, TUserState>, toPlanState?: (state: TPlanState) => void) {
        const fact = { name: `before ${navigation}`, at: navigation, ifPlanState, do: fn, config: defaultExpectationConfig() }
        facts.before.push(fact)
        return {
          with(config: (config: ExpectationConfig) => void) {
            config(fact.config)
          }
        }
      }
    }
  }

  beforeEntering(state: string, ifPlanState?: (state: TPlanState) => boolean) {
    const facts = this.facts
    return {
      do(fn: StepFn<TPlanState, TUserState>, toPlanState?: (state: TPlanState) => void) {
        const fact = { name: `before entering ${state}`, at: state, ifPlanState, do: fn, config: defaultExpectationConfig() }
        facts.beforeEntering.push(fact)
        return {
          with(config: (config: ExpectationConfig) => void) {
            config(fact.config)
          }
        }
      }
    }
  }
  
  beforeExiting(state: string, ifPlanState?: (state: TPlanState) => boolean) {
    const facts = this.facts
    return {
      do(fn: StepFn<TPlanState, TUserState>, toPlanState?: (state: TPlanState) => void) {
        const fact = { name: `before exiting ${state}`, at: state, ifPlanState, do: fn, config: defaultExpectationConfig() }
        facts.beforeExiting.push(fact)
        return {
          with(config: (config: ExpectationConfig) => void) {
            config(fact.config)
          }
        }
      }
    }
  }

  after(navigation: string, ifPlanState?: (state: TPlanState) => boolean) {
    const facts = this.facts
    return {
      do(fn: StepFn<TPlanState, TUserState>, toPlanState?: (state: TPlanState) => void) {
        const fact = { name: `after ${navigation}`, at: navigation, ifPlanState, do: fn, config: defaultExpectationConfig() }
        facts.after.push(fact)
        return {
          with(config: (config: ExpectationConfig) => void) {
            config(fact.config)
          }
        }
      }
    }
  }
  
  afterEntering(state: string, ifPlanState?: (state: TPlanState) => boolean) {
    const facts = this.facts
    return {
      do(fn: StepFn<TPlanState, TUserState>, toPlanState?: (state: TPlanState) => void) {
        const fact = { name: `after entering ${state}`, at: state, ifPlanState, do: fn, config: defaultExpectationConfig() }
        facts.afterEntering.push(fact)
        return {
          with(config: (config: ExpectationConfig) => void) {
            config(fact.config)
          }
        }
      }
    }
  }

  afterExiting(state: string, ifPlanState?: (state: TPlanState) => boolean) {
    const facts = this.facts
    return {
      do(fn: StepFn<TPlanState, TUserState>, toPlanState?: (state: TPlanState) => void) {
        const fact = { name: `after exiting ${state}`, at: state, ifPlanState, do: fn, config: defaultExpectationConfig() }
        facts.afterExiting.push(fact)
        return {
          with(config: (config: ExpectationConfig) => void) {
            config(fact.config)
          }
        }
      }
    }
  }

  add(sut: FluentStuff<TPlanState, TUserState>) {
    this.facts.after.push(...sut.facts.after)
    this.facts.afterAll.push(...sut.facts.afterAll)
    this.facts.afterEntering.push(...sut.facts.afterEntering)
    this.facts.afterExiting.push(...sut.facts.afterExiting)
    this.facts.before.push(...sut.facts.before)
    this.facts.beforeAll.push(...sut.facts.beforeAll)
    this.facts.beforeEntering.push(...sut.facts.beforeEntering)
    this.facts.beforeExiting.push(...sut.facts.beforeExiting)
    this.facts.navigation.push(...sut.facts.navigation)
    this.facts.finally.push(...sut.facts.finally)
  }

  finally(callback: StepFn<TPlanState, TUserState>, ifPlanState?: (state: TPlanState) => boolean) {
    this.facts.finally.push({ do: callback, ifPlanState })
  }
}
