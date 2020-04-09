# Theseus
Path-based testing decomplected.

This is still very alpha.


## Example

First, use attributes to tell Theseus how to use your site. Here are some facts 
about how to use the Selenium `IWebDriver` to use boardgamegeek.com. Each fact 
is a single-parameter method that takes the type you're using or a Theseus `Context` 
that wraps whatever type you're using. The return type can be `void` or `Task`.

```c#
public class BoardGameGeek
{
    [BeforeEntering("start")]
    public void Start(IWebDriver driver)
    {
        driver.Navigate().GoToUrl("http://www.boardgamegeek.com/");
    }

    [Navigation("game", "artist")]
    public Task ClickOnGameArtist(IWebDriver driver)
    {
        driver.FindElement(By.CssSelector("a[href^='/boardgameartist']")).Click();
        return Task.CompletedTask;
    }

    [Navigation("game", "publisher")]
    public void ClickOnGamePublisher(Context<IWebDriver> context)
    {
        context.State.FindElement(By.CssSelector("a[href^='/boardgamepublisher']")).Click();
    }
}
```

Or, you can create instances of facts directly.
```c#
var facts = new List<IFact<IWebDriver>>
{
    Navigation<IWebDriver>.WithAction("start", "search results", context => {
        context.State
            .FindElement(By.Id("sitesearch"))
            .SendKeys("terraforming mars\n");
    }),
    Navigation<IWebDriver>.WithAction("search results", "game", context => {
        context.State
            .FindElement(By.Id("results_objectname1"))
            .Click();
    }),
    Navigation<IWebDriver>.WithAction("game", "designer", context => {
        context.State
            .FindElement(By.CssSelector("a[href^='/boardgamedesigner']"))
            .Click();
    }),
    // etc
};
```

Then use the Theseus `Runner` class to navigate.

```c#
[TestMethod]
void ArtistPageShouldHaveDescription() 
{
    var runner = new Runner<IWebDriver>(facts);
    runner.AddFactsFrom<BoardGameGeek>();
    
    using (var driver = new ChromeDriver())
    {
        // Arrange
        await runner.RunShortestPath(driver, "start", "artist");

        // Act

        // Assert
        var descriptionSection = driver.FindElements(By.Id("editdesc")).SingleOrDefault();
        Assert.IsNotNull(descriptionSection);
    }
}
```

Or create facts about your system that Theseus will check for you when navigating.

```c#
[AfterEntering("game")]
public void ExpectOneRegisterLink(IWebDriver driver)
{
    var registerLinkCount = context.State
        .FindElements(By.CssSelector("a[href='/register']"))
        .Count;
    Assert.AreEqual(1, registerLinkCount, "There should be one register link on a game's page");
}
```

There's a more in-depth example in the Example project.

## Path-based testing decomplected?

Path-based because Theseus creates paths through your app for you instead of you
having to do that each time.

Decomplected because instead of having a large set of automated integration tests
where each test navigates through your system to a specific place, does some stuff,
and verifies some state along the way; you keep your assertions, data, states, how
to navigate, how to do domain actions, etc all seperate and Theseus combines them
for you.


## Facts

Facts describe your system as a state machine.

```c#
Navigation(string fromStateName, string toStateName)
```

```c#
BeforeEntering(string stateName)
```

```c#
BeforeLeaving(string stateName)
```

```c#
AfterEntering(string stateName)
```

```c#
AfterLeaving(string stateName)
```

## TODO
Theseus is still a very new project so there's a lot to be done.

Better documentation and examples.

Handle AssertionFailedException and add better messages.

Integrate with Visual Studio test runner (does not work with Community edition?).
 * https://blogs.msdn.microsoft.com/bhuvaneshwari/2012/03/13/authoring-a-new-visual-studio-unit-test-adapter/

Integrate with Selenium.
 * You can use the selenium IWebDriver as the state to your facts. Maybe there's a better way to do this though?

Create a visual graph from a set of facts.

Maybe facts have preconditions and postconditions?
