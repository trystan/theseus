using System;
using System.Threading.Tasks;

namespace Theseus
{
    public interface IFact<T>
    {
        string Label { get; set; }
        Func<Context<T>,Task> Action { get; }
    }

    public class Navigation<T> : IFact<T>
    {
        public string Label { get; set; }
        public string From { get; private set; }
        public string To { get; private set; }
        public string[] Requires { get; private set; } 

        public Func<Context<T>,Task> Action { get; set; }

        public Navigation(string from, string to, string[] requires = null)
        {
            From = from;
            To = to;
            Requires = requires;
            Action = _ => Task.CompletedTask;
        }

        public static Navigation<T> WithAction(string from, string to, Action<Context<T>> action, string[] requires = null)
        {
            return new Navigation<T>(from, to, requires) { Action = ctx => { action(ctx); return Task.CompletedTask; } };
        }

        public static Navigation<T> WithAsyncFunc(string from, string to, Func<Context<T>,Task> action, string[] requires = null)
        {
            return new Navigation<T>(from, to, requires) { Action = action };
        }
    }

    public class BeforeEntering<T> : IFact<T>
    {
        public string Label { get; set; }
        public string State { get; private set; }
        public Func<Context<T>,Task> Action { get; set; }
        
        public BeforeEntering(string state)
        {
            State = state;
            Action = _ => Task.CompletedTask;
        }

        public static BeforeEntering<T> WithAction(string state, Action<Context<T>> action)
        {
            return new BeforeEntering<T>(state) { Action = ctx => { action(ctx); return Task.CompletedTask; } };
        }

        public static BeforeEntering<T> WithAsyncFunc(string state, Func<Context<T>,Task> action)
        {
            return new BeforeEntering<T>(state) { Action = action };
        }
    }

    public class AfterEntering<T> : IFact<T>
    {
        public string Label { get; set; }
        public string State { get; private set; }
        public Func<Context<T>,Task> Action { get; set; }

        public AfterEntering(string state)
        {
            State = state;
            Action = _ => Task.CompletedTask;
        }

        public static AfterEntering<T> WithAction(string state, Action<Context<T>> action)
        {
            return new AfterEntering<T>(state) { Action = ctx => { action(ctx); return Task.CompletedTask; } };
        }

        public static AfterEntering<T> WithAsyncFunc(string state, Func<Context<T>,Task> action)
        {
            return new AfterEntering<T>(state) { Action = action };
        }
    }

    public class BeforeLeaving<T> : IFact<T>
    {
        public string Label { get; set; }
        public string State { get; private set; }
        public Func<Context<T>,Task> Action { get; set; }

        public BeforeLeaving(string state)
        {
            State = state;
            Action = _ => Task.CompletedTask;
        }

        public static BeforeLeaving<T> WithAction(string state, Action<Context<T>> action)
        {
            return new BeforeLeaving<T>(state) { Action = ctx => { action(ctx); return Task.CompletedTask; } };
        }

        public static BeforeLeaving<T> WithAsyncFunc(string state, Func<Context<T>,Task> action)
        {
            return new BeforeLeaving<T>(state) { Action = action };
        }
    }

    public class AfterLeaving<T> : IFact<T>
    {
        public string Label { get; set; }
        public string State { get; private set; }
        public Func<Context<T>,Task> Action { get; set; }

        public AfterLeaving(string state)
        {
            State = state;
            Action = _ => Task.CompletedTask;
        }

        public static AfterLeaving<T> WithAction(string state, Action<Context<T>> action)
        {
            return new AfterLeaving<T>(state) { Action = ctx => { action(ctx); return Task.CompletedTask; } };
        }

        public static AfterLeaving<T> WithAsyncFunc(string state, Func<Context<T>,Task> action)
        {
            return new AfterLeaving<T>(state) { Action = action };
        }
    }
}
