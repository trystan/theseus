import { remote } from 'webdriverio'
import { FluentStuff } from '../../src/fluent'
import { addExpectations, getAllPaths, runPaths } from '../../src/theseus'

type UserState = {
  browser: WebdriverIO.Browser
}

const sut = new FluentStuff<UserState>()

sut.toNavigate().from('start').to('home').do(async state => {
  await state.browser.url('https://boardgamegeek.com/')
})

sut.to('search for a game').from('home').to('search results list').do(async state => {
  const input = await state.browser.$('input[type=search]')
  await input.setValue('Cosmic Encounter')
  const button = await state.browser.$('button[type=submit]')
  await button.click()
})

sut.toNavigate().from('search results list').to('game page').do(async state => {
  const firstResult = await state.browser.$('table.collection_table a.primary')
  await firstResult.click()
})

const run = async () => {
  const browser = await remote({
    capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: process.env.CI ? ['headless', 'disable-gpu'] : []
        }
    }
  })
  const paths = getAllPaths(sut.facts, 'start', null).map(path => addExpectations(sut.facts, path))
  const states = [{ browser }]

  await runPaths(paths, states)
}

run()