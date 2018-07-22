using System;
using System.Linq;

namespace Theseus
{
    public class Runner
    {
        public T Run<T>(T initialState, Path<T> path)
        {
            var context = new Context<T> { State = initialState };

            Run(context, path);

            return context.State;
        }

        public void Run<T>(Context<T> context, Path<T> path)
        {
            foreach (var fact in path.Sequence)
            {
                context.Path.Sequence.Add(fact);
                fact.Action(context);
            }
        }
    }
}
