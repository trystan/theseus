using System.Collections.Generic;
using OpenQA.Selenium;
using Theseus;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Example
{
    public class BoardGameGeek
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
        };

        [AfterEntering("game")]
        public void OneRegisterLink(IWebDriver driver)
        {
            var registerLinkCount = driver
                .FindElements(By.CssSelector("a[href='/register']"))
                .Count;
            Assert.AreEqual(1, registerLinkCount, "There should be one register link on a game's page");
        }

        [Navigation("game", "designer")]
        public void ClickOnGameDesigner(IWebDriver driver)
        {
            driver.FindElement(By.CssSelector("a[href^='/boardgamedesigner']")).Click();
        }

        [Navigation("game", "artist")]
        public void ClickOnGameArtist(IWebDriver driver)
        {
            driver.FindElement(By.CssSelector("a[href^='/boardgameartist']")).Click();
        }

        [Navigation("game", "publisher")]
        public void ClickOnGamePublisher(IWebDriver driver)
        {
            driver.FindElement(By.CssSelector("a[href^='/boardgamepublisher']")).Click();
        }
    }
}
