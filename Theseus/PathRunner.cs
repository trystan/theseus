using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text;

namespace Theseus
{
    public class PathRunner
    {
        public async Task<T> Run<T>(T initialState, Path<T> path)
        {
            var context = new Context<T> { State = initialState };

            return (await Run(context, path)).State;
        }

        public async Task<Context<T>> Run<T>(Context<T> context, Path<T> path)
        {
            foreach (var fact in path.Sequence)
            {
                context.Path.Sequence.Add(fact);
                await fact.Action(context);
            }
            return context;
        }
    }
}
