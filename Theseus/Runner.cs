using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Theseus
{
    public class Runner<T>
    {
        public List<IFact<T>> Facts { get; private set; }
        public FactFinder FactFinder { get; private set; }
        public PathRunner PathRunner { get; private set; }
        public PathFinder Pathfinder { get; private set; }

        public Runner() : this(new List<IFact<T>>(), new FactFinder(), new PathFinder(), new PathRunner())
        {
        }

        public Runner(List<IFact<T>> facts) : this(facts, new FactFinder(), new PathFinder(), new PathRunner())
        {
        }

        public Runner(List<IFact<T>> facts, FactFinder factFinder, PathFinder pathFinder, PathRunner pathRunner)
        {
            Facts = facts;
            FactFinder = factFinder;
            Pathfinder = pathFinder;
            PathRunner = pathRunner;
        }

        public void AddFactsFrom(Assembly assembly)
        {
            Facts.AddRange(FactFinder.FindFacts<T>(assembly));
        }

        public void AddFactsFrom<S>()
        {
            Facts.AddRange(FactFinder.FindFacts<T>(typeof(S)));
        }

        public T RunShortestPath(T initialState, string from, string to)
        {
            var path = GetShortestPath(from, to);
            if (path == null)
                throw new ArgumentException("There is no path from " + from + " to " + to, "to");

            return PathRunner.Run(initialState, path);
        }
        
        public Path<T> GetShortestPath(string from, string to)
        {
            return Pathfinder.GetPaths(Facts, from, to).OrderBy(p => p.Sequence.Count).FirstOrDefault();
        }
    }
}
