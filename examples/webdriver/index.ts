import { remote } from 'webdriverio'
import { FluentStuff } from '../../src/fluent'
import { getAllPaths, runPaths } from '../../src/theseus'
import { toGraphvizInput } from '../../src/graphviz'

type UserState = {
  browser: WebdriverIO.Browser
  data: {
    gameTitle?: string
  }
}

const sut = new FluentStuff<UserState>()

sut.toNavigate().from('start').to('home').do(async state => {
  await state.browser.url('https://boardgamegeek.com/')
})

sut.to('search for a game').from('home').to('search results list').do(async state => {
  const $ = state.browser.$.bind(state.browser)
  const input = await $('input[type=search]')
  await input.setValue(state.data.gameTitle ?? 'Cosmic Encounter')
  const button = await $('button[type=submit]')
  await button.click()
}).with(meta => {
  meta.cost = 10
})

sut.toNavigate().from('search results list').to('game page').do(async state => {
  const $ = state.browser.$.bind(state.browser)
  const firstResult = await $(Math.random() < 0.5 ? 'table.collection_table a.primary' : 'a.non-existing-class')
  state.data.gameTitle = await firstResult.getText()
  await firstResult.click()
})

sut.to('sort by board game rank').from('search results list').to('search results list').do(async state => {
  const $ = state.browser.$.bind(state.browser)
  const link = await $('=Board Game Rank')
  await link.click()
})

sut.to('sort by geek rating').from('search results list').to('search results list').do(async state => {
  const $ = state.browser.$.bind(state.browser)
  const link = await $('=Geek Rating')
  await link.click()
})

// sut.to('sort by average rating').from('search results list').to('search results list').do(async state => {
//   const $ = state.browser.$.bind(state.browser)
//   const link = await $('=Avg Rating')
//   await link.click()
// })

sut.afterEntering('game page').do(async state => {
  const $ = state.browser.$.bind(state.browser)
  const titleElement = await $('h1 span[itemprop=name]')
  const title = await titleElement.getText()
  // console.log({ title, gameTitle: state.data.gameTitle })
  if (title !== state.data.gameTitle) {
    throw new Error(`Expected "${state.data.gameTitle}", got "${title}"`)
  }
})

sut.to('cleanup').afterAll().do(async state => {
  await state.browser.deleteSession()
})

const run = async () => {
  const newBrowser = () => { return remote({
      logLevel: 'error',
      capabilities: {
          browserName: 'chrome',
          'goog:chromeOptions': {
              args: process.env.CI ? ['headless', 'disable-gpu'] : [],
          }
      }
    })
  }

  const paths = getAllPaths(sut.facts, 'start', null)

  const stateAsyncConstructors: (() => Promise<UserState>)[] = [
    async () => ({ browser: await newBrowser(), data: { gameTitle: 'Small World' } }),
    async () => ({ browser: await newBrowser(), data: { gameTitle: 'For Sale' } }),
    // async () => ({ browser: await newBrowser(), data: { } }),
  ]

  await runPaths(paths, stateAsyncConstructors)
}

run()

// console.log(toGraphvizInput(sut.facts))
