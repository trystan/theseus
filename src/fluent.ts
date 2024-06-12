import { Facts, StepFn, newFacts } from "./theseus"

export class FluentStuff<TUserState> {
  facts: Facts<TUserState>

  constructor(existingFacts?: Facts<TUserState>) {
    this.facts = existingFacts ?? newFacts()
  }

  to(name: string) {
    const facts = this.facts
    return {
      beforeAll() {
        const facts = this.facts
        return {
          do(fn: StepFn<TUserState>) {
            facts.beforeAll.push({ name, at: '* before all *', do: fn })
          }
        }
      },
    
      afterAll() {
        const facts = this.facts
        return {
          do(fn: StepFn<TUserState>) {
            facts.afterAll.push({ name, at: '* after all *', do: fn })
          }
        }
      },
      
      from(fromState: string) {
        return {
          to(toState: string) {
            return {
              do(fn: StepFn<TUserState>) {
                facts.navigation.push({ name, from: fromState, to: toState, do: fn })
              }
            }
          }
        }
      },
    
      before(navigation: string) {
        return {
          do(fn: StepFn<TUserState>) {
            facts.before.push({ name, at: navigation, do: fn })
          }
        }
      },

      beforeEntering(state: string) {
        return {
          do(fn: StepFn<TUserState>) {
            facts.beforeEntering.push({ name, at: state, do: fn })
          }
        }
      },
      
      beforeExiting(state: string) {
        return {
          do(fn: StepFn<TUserState>) {
            facts.beforeExiting.push({ name, at: state, do: fn })
          }
        }
      },
      
      after(navigation: string) {
        return {
          do(fn: StepFn<TUserState>) {
            facts.after.push({ name, at: navigation, do: fn })
          }
        }
      },

      afterEntering(state: string) {
        return {
          do(fn: StepFn<TUserState>) {
            facts.afterEntering.push({ name, at: state, do: fn })
          }
        }
      },

      afterExiting(state: string) {
        return {
          do(fn: StepFn<TUserState>) {
            facts.afterExiting.push({ name, at: state, do: fn })
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
                facts.navigation.push({ from: fromState, to: toState, do: fn })
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
        facts.beforeAll.push({ at: '* before all *', do: fn })
      }
    }
  }

  afterAll() {
    const facts = this.facts
    return {
      do(fn: StepFn<TUserState>) {
        facts.afterAll.push({ at: '* after all *', do: fn })
      }
    }
  }
  
  before(navigation: string) {
    const facts = this.facts
    return {
      do(fn: StepFn<TUserState>) {
        facts.before.push({ at: navigation, do: fn })
      }
    }
  }

  beforeEntering(state: string) {
    const facts = this.facts
    return {
      do(fn: StepFn<TUserState>) {
        facts.beforeEntering.push({ at: state, do: fn })
      }
    }
  }
  
  beforeExiting(state: string) {
    const facts = this.facts
    return {
      do(fn: StepFn<TUserState>) {
        facts.beforeExiting.push({ at: state, do: fn })
      }
    }
  }

  after(navigation: string) {
    const facts = this.facts
    return {
      do(fn: StepFn<TUserState>) {
        facts.after.push({ at: navigation, do: fn })
      }
    }
  }
  
  afterEntering(state: string) {
    const facts = this.facts
    return {
      do(fn: StepFn<TUserState>) {
        facts.afterEntering.push({ at: state, do: fn })
      }
    }
  }

  afterExiting(state: string) {
    const facts = this.facts
    return {
      do(fn: StepFn<TUserState>) {
        facts.afterExiting.push({ at: state, do: fn })
      }
    }
  }
}
