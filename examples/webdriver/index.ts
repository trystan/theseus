import { remote } from 'webdriverio'
import { FluentStuff } from '../../src/fluent'
import { addExpectations, getAllPaths, runPaths } from '../../src/theseus'

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
})

sut.toNavigate().from('search results list').to('game page').do(async state => {
  const $ = state.browser.$.bind(state.browser)
  const firstResult = await $('table.collection_table a.primary')
  state.data.gameTitle = await firstResult.getText()
  await firstResult.click()
})

sut.afterEntering('game page').do(async state => {
  const $ = state.browser.$.bind(state.browser)
  const titleElement = await $('h1 span[itemprop=name]')
  const title = await titleElement.getText()
  console.log({ title, gameTitle: state.data.gameTitle })
})

sut.to('cleanup').afterAll().do(async state => {
  await state.browser.deleteSession()
})

const run = async () => {
  const newBrowser = () => { return remote({
      capabilities: {
          browserName: 'chrome',
          'goog:chromeOptions': {
              args: process.env.CI ? ['headless', 'disable-gpu'] : []
          }
      }
    })
  }

  const paths = getAllPaths(sut.facts, 'start', null).map(path => addExpectations(sut.facts, path))
  
  const states = [
    { browser: await newBrowser(), data: { gameTitle: 'Small World' } },
    { browser: await newBrowser(), data: { gameTitle: 'For Sale' } },
    { browser: await newBrowser(), data: { } },
  ]

  await runPaths(paths, states)
}

run()