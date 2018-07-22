using System;
using System.Collections.Generic;
using System.Linq;

namespace Theseus
{
    public interface IFact
    {
    }

    public class NavigationFact : IFact
    {
        public string From { get; private set; }
        public string To { get; private set; }

        public NavigationFact(string from, string to)
        {
            From = from;
            To = to;
        }
    }

    public class BeforeEntering : IFact
    {
        public string State { get; private set; }

        public BeforeEntering(string state)
        {
            State = state;
        }
    }

    public class AfterEntering : IFact
    {
        public string State { get; private set; }

        public AfterEntering(string state)
        {
            State = state;
        }
    }

    public class BeforeLeaving : IFact
    {
        public string State { get; private set; }

        public BeforeLeaving(string state)
        {
            State = state;
        }
    }

    public class AfterLeaving : IFact
    {
        public string State { get; private set; }

        public AfterLeaving(string state)
        {
            State = state;
        }
    }

    public class Runner
    {
        public List<IFact> Facts { get; set; } = new List<IFact>();
        
        public IEnumerable<IEnumerable<IFact>> GetPaths(string from, string to)
        {
            var navFacts = Facts.OfType<NavigationFact>();

            var completedPaths = new List<List<NavigationFact>>();
            var nextPaths = new List<List<NavigationFact>>();
            var currentPaths = navFacts
                .Where(f => f.From == from)
                .Select(f => new List<NavigationFact> { f })
                .ToList();

            while (currentPaths.Any())
            {
                foreach (var path in currentPaths)
                {
                    if (path.Last().To == to)
                    {
                        completedPaths.Add(path);
                    }
                    else
                    {
                        foreach (var nextStep in navFacts
                            .Where(f => f.From == path.Last().To && !path.Contains(f)))
                        {
                            var newPath = new List<NavigationFact>();
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

            return completedPaths.Select(path => path.SelectMany(AddAssertions));
        }
        
        IEnumerable<IFact> AddAssertions(NavigationFact navigation)
        {
            var parts = new List<IFact>();
            parts.AddRange(Facts.OfType<BeforeLeaving>().Where(f => f.State == navigation.From));
            parts.AddRange(Facts.OfType<BeforeEntering>().Where(f => f.State == navigation.To));
            parts.Add(navigation);
            parts.AddRange(Facts.OfType<AfterLeaving>().Where(f => f.State == navigation.From));
            parts.AddRange(Facts.OfType<AfterEntering>().Where(f => f.State == navigation.To));
            return parts;
        }
    }
}
