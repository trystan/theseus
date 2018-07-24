using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Theseus;

namespace Tests
{
    [TestClass]
    public class PathFinderTests
    {
        class TestState { }

        [TestMethod]
        public void SingleStepPath()
        {
            var facts = new List<IFact<TestState>>
            {
                new Navigation<TestState>("a", "b"),
                new Navigation<TestState>("a", "c"),
            };

            var results = new PathFinder().GetPaths(facts, "a", "b");

            Assert.AreEqual(1, results.Count());
            
            Assert.AreEqual("a -> b", Describe(results.ElementAt(0).Sequence));
        }

        [TestMethod]
        public void SimplePath()
        {
            var facts = new List<IFact<TestState>>
            {
                new Navigation<TestState>("a", "b"),
                new Navigation<TestState>("b", "c"),
                new Navigation<TestState>("c", "d"),
            };

            var results = new PathFinder().GetPaths(facts, "a", "d");

            Assert.AreEqual(1, results.Count());
            
            Assert.AreEqual("a -> b, b -> c, c -> d", Describe(results.ElementAt(0).Sequence));
        }

        [TestMethod]
        public void MultiplePaths()
        {
            var facts = new List<IFact<TestState>>
            {
                new Navigation<TestState>("a", "b"),
                new Navigation<TestState>("a", "c"),
                new Navigation<TestState>("b", "c"),
                new Navigation<TestState>("c", "d"),
                new Navigation<TestState>("b", "d"),
            };

            var results = new PathFinder().GetPaths(facts, "a", "d");

            Assert.AreEqual(results.Count(), 3);

            Assert.AreEqual("a -> b, b -> d", Describe(results.ElementAt(0).Sequence));

            Assert.AreEqual("a -> c, c -> d", Describe(results.ElementAt(1).Sequence));
            
            Assert.AreEqual("a -> b, b -> c, c -> d", Describe(results.ElementAt(2).Sequence));
        }

        [TestMethod]
        public void NoLoops()
        {
            var facts = new List<IFact<TestState>>
            {
                new Navigation<TestState>("a", "b"),
                new Navigation<TestState>("b", "c"),
                new Navigation<TestState>("c", "a"),
                new Navigation<TestState>("c", "d"),
            };

            var results = new PathFinder().GetPaths(facts, "a", "d");

            Assert.AreEqual(results.Count(), 1);
            
            Assert.AreEqual("a -> b, b -> c, c -> d", Describe(results.ElementAt(0).Sequence));
        }

        [TestMethod]
        public void BeforeAndAfterFacts()
        {
            var facts = new List<IFact<TestState>>
            {
                new Navigation<TestState>("a", "b"),
                new Navigation<TestState>("b", "c"),
                new Navigation<TestState>("c", "d"),
                new BeforeEntering<TestState>("b"),
                new BeforeLeaving<TestState>("b"),
                new AfterEntering<TestState>("b"),
                new AfterLeaving<TestState>("b"),
                new BeforeEntering<TestState>("c"),
                new BeforeLeaving<TestState>("c"),
                new AfterEntering<TestState>("c"),
                new AfterLeaving<TestState>("c"),
            };

            var results = new PathFinder().GetPaths(facts, "a", "c");
        
            Assert.AreEqual(results.Count(), 1);
            
            var descsription = "before entering b, a -> b, after entering b, before leaving b, before entering c, b -> c, after leaving b, after entering c";
            Assert.AreEqual(descsription, Describe(results.ElementAt(0).Sequence));
        }

        [TestMethod]
        public void BeforeEverything()
        {
            var facts = new List<IFact<TestState>>
            {
                new Navigation<TestState>("a", "b"),
                new Navigation<TestState>("b", "c"),
                new BeforeEntering<TestState>("a"),
            };

            var results = new PathFinder().GetPaths(facts, "a", "c");

            Assert.AreEqual(results.Count(), 1);

            var descsription = "before entering a, a -> b, b -> c";
            Assert.AreEqual(descsription, Describe(results.ElementAt(0).Sequence));
        }

        [TestMethod]
        public void AllPaths()
        {
            var facts = new List<IFact<TestState>>
            {
                new Navigation<TestState>("a", "b"),
                new Navigation<TestState>("a", "c"),
                new Navigation<TestState>("b", "c"),
                new Navigation<TestState>("c", "d"),
                new Navigation<TestState>("b", "d"),
                new Navigation<TestState>("d", "e"),
            };

            var results = new PathFinder().GetPaths(facts, "a");

            Assert.AreEqual(results.Count(), 3);

            Assert.AreEqual("a -> b, b -> d, d -> e", Describe(results.ElementAt(0).Sequence));

            Assert.AreEqual("a -> c, c -> d, d -> e", Describe(results.ElementAt(1).Sequence));

            Assert.AreEqual("a -> b, b -> c, c -> d, d -> e", Describe(results.ElementAt(2).Sequence));
        }






        static string Describe(IFact<TestState> fact)
        {
            switch (fact)
            {
                case Navigation<TestState> nav:
                    return nav.From + " -> " + nav.To;
                case BeforeEntering<TestState> assertion:
                    return "before entering " + assertion.State;
                case BeforeLeaving<TestState> assertion:
                    return "before leaving " + assertion.State;
                case AfterEntering<TestState> assertion:
                    return "after entering " + assertion.State;
                case AfterLeaving<TestState> assertion:
                    return "after leaving " + assertion.State;
                default:
                    return "???";
            }
        }

        static string Describe(IEnumerable<IFact<TestState>> path)
        {
            return string.Join(", ", path.Select(Describe).ToArray());
        }
    }
}
