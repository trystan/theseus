using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Theseus;

namespace Tests
{
    [TestClass]
    public class FactFinderTests
    {
        [TestMethod]
        public void FindsNavigationFacts()
        {
            var assembly = System.Reflection.Assembly.GetAssembly(typeof(AttributeTestClass));
            var facts = new FactFinder().FindFacts<Logger>(assembly)
                .OfType<Navigation<Logger>>()
                .ToList();

            var logger = new Logger();

            Assert.AreEqual(2, facts.Count);

            var fact1 = facts[0];
            Assert.AreEqual("a", fact1.From);
            Assert.AreEqual("b", fact1.To);
            fact1.Action(new Context<Logger> { State = logger });
            Assert.AreEqual("TestNavigationLoggerContext was called", logger.Messages[0]);

            var fact2 = facts[1];
            Assert.AreEqual("a", fact2.From);
            Assert.AreEqual("b", fact2.To);
            fact2.Action(new Context<Logger> { State = logger });
            Assert.AreEqual("TestNavigationLogger was called", logger.Messages[1]);
        }

        [TestMethod]
        public void FindsAfterEnteringFacts()
        {
            var assembly = System.Reflection.Assembly.GetAssembly(typeof(AttributeTestClass));
            var facts = new FactFinder().FindFacts<Logger>(assembly)
                .OfType<AfterEntering<Logger>>()
                .ToList();

            var logger = new Logger();

            Assert.AreEqual(2, facts.Count);

            var fact1 = facts[0];
            Assert.AreEqual("a", fact1.State);
            fact1.Action(new Context<Logger> { State = logger });
            Assert.AreEqual("TestNavigationLoggerContext was called", logger.Messages[0]);

            var fact2 = facts[1];
            Assert.AreEqual("a", fact2.State);
            fact2.Action(new Context<Logger> { State = logger });
            Assert.AreEqual("TestNavigationLogger was called", logger.Messages[1]);
        }

        [TestMethod]
        public void FindsBeforeEnteringFacts()
        {
            var assembly = System.Reflection.Assembly.GetAssembly(typeof(AttributeTestClass));
            var facts = new FactFinder().FindFacts<Logger>(assembly)
                .OfType<BeforeEntering<Logger>>()
                .ToList();

            var logger = new Logger();

            Assert.AreEqual(2, facts.Count);

            var fact1 = facts[0];
            Assert.AreEqual("a", fact1.State);
            fact1.Action(new Context<Logger> { State = logger });
            Assert.AreEqual("TestNavigationLoggerContext was called", logger.Messages[0]);

            var fact2 = facts[1];
            Assert.AreEqual("a", fact2.State);
            fact2.Action(new Context<Logger> { State = logger });
            Assert.AreEqual("TestNavigationLogger was called", logger.Messages[1]);
        }

        [TestMethod]
        public void FindsAfterLeavingFacts()
        {
            var assembly = System.Reflection.Assembly.GetAssembly(typeof(AttributeTestClass));
            var facts = new FactFinder().FindFacts<Logger>(assembly)
                .OfType<AfterLeaving<Logger>>()
                .ToList();

            var logger = new Logger();

            Assert.AreEqual(2, facts.Count);

            var fact1 = facts[0];
            Assert.AreEqual("a", fact1.State);
            fact1.Action(new Context<Logger> { State = logger });
            Assert.AreEqual("TestNavigationLoggerContext was called", logger.Messages[0]);

            var fact2 = facts[1];
            Assert.AreEqual("a", fact2.State);
            fact2.Action(new Context<Logger> { State = logger });
            Assert.AreEqual("TestNavigationLogger was called", logger.Messages[1]);
        }

        [TestMethod]
        public void FindsBeforeLeavingFacts()
        {
            var assembly = System.Reflection.Assembly.GetAssembly(typeof(AttributeTestClass));
            var facts = new FactFinder().FindFacts<Logger>(assembly)
                .OfType<BeforeLeaving<Logger>>()
                .ToList();

            var logger = new Logger();

            Assert.AreEqual(2, facts.Count);

            var fact1 = facts[0];
            Assert.AreEqual("a", fact1.State);
            fact1.Action(new Context<Logger> { State = logger });
            Assert.AreEqual("TestNavigationLoggerContext was called", logger.Messages[0]);

            var fact2 = facts[1];
            Assert.AreEqual("a", fact2.State);
            fact2.Action(new Context<Logger> { State = logger });
            Assert.AreEqual("TestNavigationLogger was called", logger.Messages[1]);
        }
    }







    public class Logger
    {
        public List<string> Messages { get; private set; } = new List<string>();

        public void Log(string message)
        {
            Messages.Add(message);
        }
    }

    public class AttributeTestClass
    {
        [Navigation("a", "b")]
        [AfterEntering("a")]
        [BeforeEntering("a")]
        [AfterLeaving("a")]
        [BeforeLeaving("a")]
        public void TestNavigationLoggerContext(Context<Logger> context)
        {
            context.State.Log("TestNavigationLoggerContext was called");
        }

        [Navigation("a", "b")]
        [AfterEntering("a")]
        [BeforeEntering("a")]
        [AfterLeaving("a")]
        [BeforeLeaving("a")]
        public void TestNavigationLogger(Logger logger)
        {
            logger.Log("TestNavigationLogger was called");
        }

        [Navigation("a", "b")]
        [AfterEntering("a")]
        [BeforeEntering("a")]
        [AfterLeaving("a")]
        [BeforeLeaving("a")]
        public void TestNavigationBadParameter(int whatever)
        {
        }
    }
}
