using System;
using System.Collections.Generic;
using System.Linq;

namespace Theseus
{
    public class Runner<T>
    {
        public IEnumerable<IFact<T>> Facts { get; private set; }
        public PathRunner PathRunner { get; private set; }
        public PathFinder Pathfinder { get; private set; }

        public Runner(IEnumerable<IFact<T>> facts) : this(facts, new PathFinder(), new PathRunner())
        {
        }

        public Runner(IEnumerable<IFact<T>> facts, PathFinder pathFinder, PathRunner pathRunner)
        {
            Facts = facts;
            Pathfinder = pathFinder;
            PathRunner = pathRunner;
        }

        public T RunShortestPath(T initialState, string from, string to)
        {
            return PathRunner.Run(initialState, GetShortestPath(from, to));
        }
        
        public Path<T> GetShortestPath(string from, string to)
        {
            return Pathfinder.GetPaths(Facts, from, to).OrderBy(p => p.Sequence.Count).First();
        }
    }
}
