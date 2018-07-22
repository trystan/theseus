# Theseus
Path-based testing decomplected.

This is still very alpha.


## Example

```c#
// Tell Theseus how to use your site. Here are facts about how to use the
// Selenium IWebDriver to use boardgamegeek.com
List<IFact<IWebDriver>> facts = new List<IFact<IWebDriver>>
{
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
    new AfterEntering<IWebDriver>("game", context =>
    {
        var registerLinkCount = context.State
            .FindElements(By.CssSelector("a[href='/register']"))
            .Count;
        Assert.AreEqual(1, registerLinkCount, "There should be one register link on a game's page");
    }),
    // etc
};

// Then ask Theseus how to do something.
var shortestPath = new Pathfinder().GetPaths(facts, "home", "publisher")
    .OrderBy(path => path.Sequence.Count)
    .First();

// Then tell Theseus to do it. (this is not yet integrated into the Visual Studio test runner)
using (var driver = new ChromeDriver("C:\\Program Files (x86)"))
{
    driver.Navigate().GoToUrl("http://www.boardgamegeek.com/");

    new Runner().Run(driver, shortestPath);
}
```

There's a more in-depth example in the Example project.


## Path-based testing decomplected?
Path-based because Theseus creates paths through your app for you instead of you having to do that each time.

Decomplected because instead of having a large set of automated integration tests where each test navigates 
through your system to a specific place, does some stuff, and verifies some state along the way; you keep your 
assertions, data, states, how to navigate, how to do domain actions, etc all seperate and Theseus combines 
them for you.


## To use
First you create a collection of facts about your system that describe how to use your applciation as well
as how you expect it to work. 

Navigation

BeforeEntering

BeforeLeaving

AfterEntering

AfterLeaving


## TODO
Theseus is still a very new project so there's a lot to be done.

Handle AssertionFailedException and add better messages.

Integrate with Visual Studio test runner (does not work with Community edition?).
 * https://blogs.msdn.microsoft.com/bhuvaneshwari/2012/03/13/authoring-a-new-visual-studio-unit-test-adapter/

Integrate with Selenium.
 * You can use the selenium IWebDriver as the state to your facts. Maybe there's a better way to do this though?

Use attributes to create facts from methods and classes?

Create a visual graph from a set of facts.

Maybe facts have preconditions and postconditions?
