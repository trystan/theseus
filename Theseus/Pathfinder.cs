using System.Collections.Generic;
using System.Linq;

namespace Theseus
{
    public class Pathfinder
    {
        public IEnumerable<Path<T>> GetPaths<T>(IEnumerable<IFact<T>> facts, string from)
        {
            var nextPaths = new List<List<Navigation<T>>>();
            var currentPaths = facts
                .OfType<Navigation<T>>()
                .Where(f => f.From == from)
                .Select(f => new List<Navigation<T>> { f })
                .ToList();

            while (currentPaths.Any())
            {
                foreach (var path in currentPaths)
                {
                    var nexts = GetNextPaths(facts, path);
                    if (nexts.Any())
                    {
                        nextPaths.AddRange(nexts);
                    }
                    else
                    {
                        yield return GetCompletePath(facts, path);
                    }
                }
                currentPaths.Clear();
                currentPaths.AddRange(nextPaths);
                nextPaths.Clear();
            }
        }

        public IEnumerable<Path<T>> GetPaths<T>(IEnumerable<IFact<T>> facts, string from, string to)
        {
            var nextPaths = new List<List<Navigation<T>>>();
            var currentPaths = facts
                .OfType<Navigation<T>>()
                .Where(f => f.From == from)
                .Select(f => new List<Navigation<T>> { f })
                .ToList();

            while (currentPaths.Any())
            {
                foreach (var path in currentPaths)
                {
                    if (path.Last().To == to)
                    {
                        yield return GetCompletePath(facts, path);
                    }
                    else
                    {
                        nextPaths.AddRange(GetNextPaths(facts, path));
                    }
                }
                currentPaths.Clear();
                currentPaths.AddRange(nextPaths);
                nextPaths.Clear();
            }
        }

        private IEnumerable<List<Navigation<T>>> GetNextPaths<T>(IEnumerable<IFact<T>> facts, List<Navigation<T>> pathSoFar)
        {
            foreach (var nextStep in facts
                .OfType<Navigation<T>>()
                .Where(f => f.From == pathSoFar.Last().To && !pathSoFar.Contains(f)))
            {
                var newPath = new List<Navigation<T>>();
                newPath.AddRange(pathSoFar);
                newPath.Add(nextStep);
                yield return newPath;
            }
        }

        private Path<T> GetCompletePath<T>(IEnumerable<IFact<T>> facts, List<Navigation<T>> pathSoFar)
        {
            var fullPath = new List<IFact<T>>();

            foreach (var navigation in pathSoFar)
            {
                fullPath.AddRange(facts.OfType<BeforeLeaving<T>>().Where(f => f.State == navigation.From));
                fullPath.AddRange(facts.OfType<BeforeEntering<T>>().Where(f => f.State == navigation.To));
                fullPath.Add(navigation);
                fullPath.AddRange(facts.OfType<AfterLeaving<T>>().Where(f => f.State == navigation.From));
                fullPath.AddRange(facts.OfType<AfterEntering<T>>().Where(f => f.State == navigation.To));
            }

            return new Path<T>(fullPath);
        }
    }
}
