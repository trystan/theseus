# Theseus

A new tool in the testing toolbox. Describe how to use your system, then use that description to test assumptions, automate navigation, make graphs, or whatever.

## To install

> TODO: 
> 
> probably something like `npm install theseus --save-dev`
>
> Requires node version x.y.z, etc

## Why?

I've experienced some issues with browser-based end-to-end tests. And also other high-level tests. My belief is that by decomplecting navigation, assertions, essentials, accidentals, writing tests, and running tests, maybe things can be better. This is an attempt at finding out.

## To use

> ⚠ WARNING ⚠ 
> 
> This is super secret pre-alpha and just a proof of concept for now. Expect breaking changes. Maybe even the name will change. idk 🤷‍♂️

Describe how to navigate your system, with an optional name for each navigation step.

```ts
const sut = new FluentStuff<UserDefinedState>()

sut.toNavigate().from('*start*').to('home').do(() => {
  // TODO
})

sut.to('search for a product').from('home').to('product search results list').do(() => {
  // TODO
})
```

Congrats! Now you've described a state machine that describes navigating your system. Once you  have enough of these facts, you can do things like generate graphs of your system and how to use it.

> TODO: give an example of generating a graphviz svg

> TODO: give an example of some sort of linter

You can also add some extra details related to using your system. Before or after navigating, before or after entering a state, before or after exiting a state, and a few others. This is a great place to add assertions or store details of the current state of the system for future assertions.

```ts
sut.beforeEntering('logged out').do(async state => {
  // TODO: verify session cookie exists
})

sut.afterEntering('logged out').do(async state => {
  // TODO: verify session cookie doesn't exist
})

sut.to('cleanup').afterAll().do(async state => {
  // TODO: remove session cookie, etc
})
```

But, to get the real benefits, describe how to _actually do_ those things with some user-defined state. In this case, the `sut` is a website and we're using a webdriver to use it. But Theseus is unopinionated about what's being tested or how. It could use a webdriver against some fronted, or HTTP requests against an API, or direct usage of an SDK, or a CLI, or whatever. The principles are the same.

```ts
sut.toNavigate().from('search results list').to('product page').do(async state => {
  const firstResult = await state.browser.$('.product_list a.product_title')
  await firstResult.click()
})
```

Once you have described how to use your system, you can use a path runner to run all the paths in your system and verify your assumptions.

> TODO: give a few good examples of different ways to use Theseus

## Examples

Take a look at a few included examples:
 * `./examples/simple/index.ts`
 * `./examples/webdriver/index.ts`

