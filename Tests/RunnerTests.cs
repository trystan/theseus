using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Theseus;

namespace Tests
{
    [TestClass]
    public class RunnerTests
    {
        static string Describe(IFact fact)
        {
            switch (fact)
            {
                case NavigationFact nav:
                    return nav.From + " -> " + nav.To;
                case BeforeEntering assertion:
                    return "before entering " + assertion.State;
                case BeforeLeaving assertion:
                    return "before leaving " + assertion.State;
                case AfterEntering assertion:
                    return "after entering " + assertion.State;
                case AfterLeaving assertion:
                    return "after leaving " + assertion.State;
                default:
                    return "???";
            }
        }

        static string Describe(IEnumerable<IFact> path)
        {
            return string.Join(", ", path.Select(Describe).ToArray());
        }
        
        [TestMethod]
        public void SingleStepPath()
        {
            var runner = new Runner();
            runner.Facts.Add(new NavigationFact("a", "b"));
            runner.Facts.Add(new NavigationFact("a", "c"));

            var results = runner.GetPaths("a", "b");

            Assert.AreEqual(1, results.Count());
            
            Assert.AreEqual("a -> b", Describe(results.ElementAt(0)));
        }

        [TestMethod]
        public void SimplePath()
        {
            var runner = new Runner();
            runner.Facts.Add(new NavigationFact("a", "b"));
            runner.Facts.Add(new NavigationFact("b", "c"));
            runner.Facts.Add(new NavigationFact("c", "d"));

            var results = runner.GetPaths("a", "d");

            Assert.AreEqual(1, results.Count());
            
            Assert.AreEqual("a -> b, b -> c, c -> d", Describe(results.ElementAt(0)));
        }

        [TestMethod]
        public void MultiplePaths()
        {
            var runner = new Runner();
            runner.Facts.Add(new NavigationFact("a", "b"));
            runner.Facts.Add(new NavigationFact("a", "c"));
            runner.Facts.Add(new NavigationFact("b", "c"));
            runner.Facts.Add(new NavigationFact("c", "d"));
            runner.Facts.Add(new NavigationFact("b", "d"));

            var results = runner.GetPaths("a", "d");

            Assert.AreEqual(results.Count(), 3);

            Assert.AreEqual("a -> b, b -> d", Describe(results.ElementAt(0)));

            Assert.AreEqual("a -> c, c -> d", Describe(results.ElementAt(1)));
            
            Assert.AreEqual("a -> b, b -> c, c -> d", Describe(results.ElementAt(2)));
        }

        [TestMethod]
        public void NoLoops()
        {
            var runner = new Runner();
            runner.Facts.Add(new NavigationFact("a", "b"));
            runner.Facts.Add(new NavigationFact("b", "c"));
            runner.Facts.Add(new NavigationFact("c", "a"));
            runner.Facts.Add(new NavigationFact("c", "d"));

            var results = runner.GetPaths("a", "d");

            Assert.AreEqual(results.Count(), 1);
            
            Assert.AreEqual("a -> b, b -> c, c -> d", Describe(results.ElementAt(0)));
        }

        [TestMethod]
        public void BeforeAndAfterFacts()
        {
            var runner = new Runner();
            runner.Facts.Add(new NavigationFact("a", "b"));
            runner.Facts.Add(new NavigationFact("b", "c"));
            runner.Facts.Add(new BeforeEntering("b"));
            runner.Facts.Add(new BeforeLeaving("b"));
            runner.Facts.Add(new AfterEntering("b"));
            runner.Facts.Add(new AfterLeaving("b"));

            var results = runner.GetPaths("a", "c");

            Assert.AreEqual(results.Count(), 1);
            
            Assert.AreEqual("before entering b, a -> b, after entering b, before leaving b, b -> c, after leaving b", Describe(results.ElementAt(0)));
        }
    }
}
