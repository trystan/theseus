using System.Collections.Generic;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Theseus;

namespace Tests
{
    [TestClass]
    public class RunnerTests
    {
        [TestMethod]
        public void KeepTrackOfPath()
        {
            var path = new Path<int>(new List<IFact<int>>
            {
                new Navigation<int>("a","b"),
                new Navigation<int>("b","c"),
                new Navigation<int>("c","d"),
                new AfterLeaving<int>("c"),
            });

            var context = new Context<int> { State = 0 };

            new Runner().Run(context, path);

            Assert.AreEqual(path.Facts.Count, context.Path.Facts.Count);
            Assert.AreEqual(path.Facts[0], context.Path.Facts[0]);
            Assert.AreEqual(path.Facts[1], context.Path.Facts[1]);
            Assert.AreEqual(path.Facts[2], context.Path.Facts[2]);
            Assert.AreEqual(path.Facts[3], context.Path.Facts[3]);
        }

        [TestMethod]
        public void RunWithCustomState()
        {
            var path = new Path<int>(new List<IFact<int>>
            {
                new Navigation<int>("a","b", x => x.State += 5),
                new Navigation<int>("b","c", x => x.State *= 4),
                new Navigation<int>("c","d", x => x.State /= 2),
                new AfterLeaving<int>("c", x => x.State += 2),
            });

            var context = new Context<int> { State = 0 };

            new Runner().Run(context, path);

            Assert.AreEqual(12, context.State);
        }
    }
}
