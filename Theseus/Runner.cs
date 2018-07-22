using System.Collections.Generic;

namespace Theseus
{
    public class Runner
    {
        public void Run<T>(Context<T> context, IEnumerable<IFact<T>> path)
        {
            foreach (var fact in path)
            {
                context.Path.Add(fact);
                fact.Action(context);
            }
        }
    }
}
