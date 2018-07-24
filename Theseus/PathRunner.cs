using System;
using System.Collections.Generic;
using System.Text;

namespace Theseus
{
    public class PathRunner
    {
        public T Run<T>(T initialState, Path<T> path)
        {
            var context = new Context<T> { State = initialState };

            return Run(context, path).State;
        }

        public Context<T> Run<T>(Context<T> context, Path<T> path)
        {
            foreach (var fact in path.Sequence)
            {
                context.Path.Sequence.Add(fact);
                fact.Action(context);
            }
            return context;
        }
    }
}
