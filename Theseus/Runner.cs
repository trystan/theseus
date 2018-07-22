using System.Collections.Generic;

namespace Theseus
{
    public class Runner
    {
        public void Run<T>(Context<T> context, Path<T> path)
        {
            foreach (var fact in path.Facts)
            {
                context.Path.Facts.Add(fact);
                fact.Action(context);
            }
        }
    }
}
