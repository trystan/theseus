using OpenQA.Selenium.Chrome;
using Theseus;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Example
{
    [TestClass]
    public class BoardGameGeekTests
    {
        [TestMethod]
        public void CanNavigateToPublisherPage()
        {
            var shortestPath = new Pathfinder().GetPaths(BoardGameGeek.Facts, "home", "publisher")
                .OrderBy(path => path.Sequence.Count)
                .First();
           
            using (var driver = new ChromeDriver("C:\\Program Files (x86)"))
            {
                driver.Navigate().GoToUrl("http://www.boardgamegeek.com/");

                new Runner().Run(driver, shortestPath);
            }
        }

        [TestMethod]
        public void CanNavigateToArtistPage()
        {
            var shortestPath = new Pathfinder().GetPaths(BoardGameGeek.Facts, "home", "artist")
                .OrderBy(path => path.Sequence.Count)
                .First();

            using (var driver = new ChromeDriver("C:\\Program Files (x86)"))
            {
                driver.Navigate().GoToUrl("http://www.boardgamegeek.com/");

                new Runner().Run(driver, shortestPath);
            }
        }
    }
}
