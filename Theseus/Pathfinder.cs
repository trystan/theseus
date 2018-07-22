using System.Collections.Generic;
using System.Linq;

namespace Theseus
{
    public class Pathfinder
    {
        public IEnumerable<Path<T>> GetPaths<T>(IEnumerable<IFact<T>> facts, string from, string to)
        {
            var navFacts = facts.OfType<Navigation<T>>();

            var completedPaths = new List<Path<T>>();
            var nextPaths = new List<List<Navigation<T>>>();
            var currentPaths = navFacts
                .Where(f => f.From == from)
                .Select(f => new List<Navigation<T>> { f })
                .ToList();

            while (currentPaths.Any())
            {
                foreach (var path in currentPaths)
                {
                    if (path.Last().To == to)
                    {
                        var fullPath = new List<IFact<T>>();

                        foreach (var navigation in path)
                        {
                            fullPath.AddRange(facts.OfType<BeforeLeaving<T>>().Where(f => f.State == navigation.From));
                            fullPath.AddRange(facts.OfType<BeforeEntering<T>>().Where(f => f.State == navigation.To));
                            fullPath.Add(navigation);
                            fullPath.AddRange(facts.OfType<AfterLeaving<T>>().Where(f => f.State == navigation.From));
                            fullPath.AddRange(facts.OfType<AfterEntering<T>>().Where(f => f.State == navigation.To));
                        }

                        completedPaths.Add(new Path<T>(fullPath));
                    }
                    else
                    {
                        foreach (var nextStep in navFacts
                            .Where(f => f.From == path.Last().To && !path.Contains(f)))
                        {
                            var newPath = new List<Navigation<T>>();
                            newPath.AddRange(path);
                            newPath.Add(nextStep);
                            nextPaths.Add(newPath);
                        }
                    }
                }
                currentPaths.Clear();
                currentPaths.AddRange(nextPaths);
                nextPaths.Clear();
            }

            return completedPaths;
        }
    }
}
