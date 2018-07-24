# Theseus
Path-based testing decomplected.

This is still very alpha.


## Example

First tell Theseus how to use your site. Here are some facts about how to use
the Selenium `IWebDriver` to use boardgamegeek.com.
```c#
var facts = new List<IFact<IWebDriver>>
{
    new BeforeEntering<IWebDriver>("home", context =>
    {
        context.State
            .Navigate()
            .GoToUrl("http://www.boardgamegeek.com/");
    }),
    new Navigation<IWebDriver>("home", "search results", context => {
        context.State
            .FindElement(By.Id("sitesearch"))
            .SendKeys("terraforming mars\n");
    }),
    new Navigation<IWebDriver>("search results", "game", context => {
        context.State
            .FindElement(By.Id("results_objectname1"))
            .Click();
    }),
    // etc
};
```

Then use the Theseus Runner class to navigate.

```c#
[TestMethod]
void ArtistPageShouldHaveDescription() 
{
    var runner = new Runner<IWebDriver>(facts);
     
    using (var driver = new ChromeDriver())
    {
        // Arrange
        runner.RunShortestPath(driver, "start", "artist");

        // Act

        // Assert
        var descriptionSection = driver.FindElements(By.Id("editdesc")).SingleOrDefault();
        Assert.IsNotNull(descriptionSection);
    }
}
```

Or create facts about your system that Theseus will check for you when navigating.

```c#
    new AfterEntering<IWebDriver>("game", context =>
    {
        var registerLinkCount = context.State
            .FindElements(By.CssSelector("a[href='/register']"))
            .Count;
        Assert.AreEqual(1, registerLinkCount,	"There should be one register link on a game's page");
    }),
```


There's a more in-depth example in the Example project.


## Path-based testing decomplected?
Path-based because Theseus creates paths through your app for you instead of you having to do that each time.

Decomplected because instead of having a large set of automated integration tests where each test navigates 
through your system to a specific place, does some stuff, and verifies some state along the way; you keep your 
assertions, data, states, how to navigate, how to do domain actions, etc all seperate and Theseus combines 
them for you.


## Facts

Facts describe your system as a state machine.

```c#
Navigation(string fromStateName, string toStateName, Action<Context<T>> action)
```

```c#
BeforeEntering(string stateName, Action<Context<T>> action)
```

```c#
BeforeLeaving(string stateName, Action<Context<T>> action)
```

```c#
AfterEntering(string stateName, Action<Context<T>> action)
```

```c#
AfterLeaving(string stateName, Action<Context<T>> action)
```

## TODO
Theseus is still a very new project so there's a lot to be done.

Better documentation and examples.

Handle AssertionFailedException and add better messages.

Integrate with Visual Studio test runner (does not work with Community edition?).
 * https://blogs.msdn.microsoft.com/bhuvaneshwari/2012/03/13/authoring-a-new-visual-studio-unit-test-adapter/

Integrate with Selenium.
 * You can use the selenium IWebDriver as the state to your facts. Maybe there's a better way to do this though?

Use attributes to create facts from methods and classes?
```c#
[Navigate("login","main")]
public void SkipLoginStep(IWebDriver driver)
{
    driver.FindElementById("skip").Click();
}

[AfterEntering("home")]
public void HomePageShouldSayHelloUserName(IWebDriver driver)
{
    Assert.AreEqual("Hello Trystan", driver.FindElementById("welcome").Text);
}
```

Create a visual graph from a set of facts.

Maybe facts have preconditions and postconditions?
