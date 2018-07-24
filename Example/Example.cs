using OpenQA.Selenium.Chrome;
using Theseus;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;

namespace Example
{
    [TestClass]
    public class BoardGameGeekTests
    {
        [TestMethod]
        public void CanNavigateToPublisherPage()
        {
            var runner = new Runner<IWebDriver>(BoardGameGeek.Facts);

            using (var driver = new ChromeDriver("C:\\Program Files (x86)"))
            {
                runner.RunShortestPath(driver, "start", "publisher");
            }
        }

        [TestMethod]
        public void CanNavigateToArtistPage()
        {
            var runner = new Runner<IWebDriver>(BoardGameGeek.Facts);

            using (var driver = new ChromeDriver("C:\\Program Files (x86)"))
            {
                runner.RunShortestPath(driver, "start", "artist");
            }
        }
    }
}
