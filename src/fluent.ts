import { Facts } from "./theseus"

export class FluentStuff<TUserState> {
  facts: Facts<TUserState>

  constructor(facts: Facts<TUserState>) {
    this.facts = facts
  }

  to(name: string) {
    const facts = this.facts
    return {
      from(fromState: string) {
        return {
          to(toState: string) {
            return {
              do(fn: (state: TUserState) => void) {
                facts.navigation.push({ name, from: fromState, to: toState, do: fn })
              }
            }
          }
        }
      },
    
      before(navigation: string) {
        return {
          do(fn: (state: TUserState) => void) {
            facts.before.push({ name, at: navigation, do: fn })
          }
        }
      },

      beforeEntering(state: string) {
        return {
          do(fn: (state: TUserState) => void) {
            facts.beforeEntering.push({ name, at: state, do: fn })
          }
        }
      },
      
      beforeExiting(state: string) {
        return {
          do(fn: (state: TUserState) => void) {
            facts.beforeExiting.push({ name, at: state, do: fn })
          }
        }
      },
      
      after(navigation: string) {
        return {
          do(fn: (state: TUserState) => void) {
            facts.after.push({ name, at: navigation, do: fn })
          }
        }
      },

      afterEntering(state: string) {
        return {
          do(fn: (state: TUserState) => void) {
            facts.afterEntering.push({ name, at: state, do: fn })
          }
        }
      },

      afterExiting(state: string) {
        return {
          do(fn: (state: TUserState) => void) {
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
              do(fn: (state: TUserState) => void) {
                facts.navigation.push({ from: fromState, to: toState, do: fn })
              }
            }
          }
        }
      }
    }
  }
  
  before(navigation: string) {
    const facts = this.facts
    return {
      do(fn: (state: TUserState) => void) {
        facts.before.push({ at: navigation, do: fn })
      }
    }
  }

  beforeEntering(state: string) {
    const facts = this.facts
    return {
      do(fn: (state: TUserState) => void) {
        facts.beforeEntering.push({ at: state, do: fn })
      }
    }
  }
  
  beforeExiting(state: string) {
    const facts = this.facts
    return {
      do(fn: (state: TUserState) => void) {
        facts.beforeExiting.push({ at: state, do: fn })
      }
    }
  }

  after(navigation: string) {
    const facts = this.facts
    return {
      do(fn: (state: TUserState) => void) {
        facts.after.push({ at: navigation, do: fn })
      }
    }
  }
  
  afterEntering(state: string) {
    const facts = this.facts
    return {
      do(fn: (state: TUserState) => void) {
        facts.afterEntering.push({ at: state, do: fn })
      }
    }
  }

  afterExiting(state: string) {
    const facts = this.facts
    return {
      do(fn: (state: TUserState) => void) {
        facts.afterExiting.push({ at: state, do: fn })
      }
    }
  }
}
