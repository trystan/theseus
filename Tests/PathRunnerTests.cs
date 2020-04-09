using System.Collections.Generic;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Theseus;
using System.Threading.Tasks;

namespace Tests
{
    [TestClass]
    public class PathRunnerTests
    {
        [TestMethod]
        public async Task KeepTrackOfPath()
        {
            var path = new Path<int>(new List<IFact<int>>
            {
                new Navigation<int>("a","b"),
                new Navigation<int>("b","c"),
                new Navigation<int>("c","d"),
                new AfterLeaving<int>("c"),
            });

            var context = new Context<int> { State = 0 };

            await new PathRunner().Run(context, path);

            Assert.AreEqual(path.Sequence.Count, context.Path.Sequence.Count);
            Assert.AreEqual(path.Sequence[0], context.Path.Sequence[0]);
            Assert.AreEqual(path.Sequence[1], context.Path.Sequence[1]);
            Assert.AreEqual(path.Sequence[2], context.Path.Sequence[2]);
            Assert.AreEqual(path.Sequence[3], context.Path.Sequence[3]);
        }

        [TestMethod]
        public async Task RunWithCustomState()
        {
            var path = new Path<int>(new List<IFact<int>>
            {
                Navigation<int>.WithAction("a","b", x => x.State += 5),
                Navigation<int>.WithAction("b","c", x => x.State *= 4),
                Navigation<int>.WithAction("c","d", x => x.State /= 2),
                BeforeLeaving<int>.WithAction("c", x => x.State += 2),
            });

            var context = new Context<int> { State = 0 };

            await new PathRunner().Run(context, path);

            Assert.AreEqual(12, context.State);
        }
    }
}
