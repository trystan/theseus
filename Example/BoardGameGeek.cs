using System.Collections.Generic;
using OpenQA.Selenium;
using Theseus;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Example
{
    public static class BoardGameGeek
    {
        public static List<IFact<IWebDriver>> Facts { get; private set; } = new List<IFact<IWebDriver>>
        {
            new BeforeEntering<IWebDriver>("start", context =>
            {
                context.State
                    .Navigate()
                    .GoToUrl("http://www.boardgamegeek.com/");
            }),
            new Navigation<IWebDriver>("start", "search results", context => {
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
            new Navigation<IWebDriver>("game", "designer", context => {
                context.State
                    .FindElement(By.CssSelector("a[href^='/boardgamedesigner']"))
                    .Click();
            }),
            new Navigation<IWebDriver>("game", "artist", context => {
                context.State
                    .FindElement(By.CssSelector("a[href^='/boardgameartist']"))
                    .Click();
            }),
            new Navigation<IWebDriver>("game", "publisher", context => {
                context.State
                    .FindElement(By.CssSelector("a[href^='/boardgamepublisher']"))
                    .Click();
            }),
        };
    }
}
