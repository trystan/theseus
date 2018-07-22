using System;

namespace Theseus
{
    public interface IFact<T>
    {
        Action<Context<T>> Action { get; }
    }

    public class Navigation<T> : IFact<T>
    {
        public string From { get; private set; }
        public string To { get; private set; }
        public Action<Context<T>> Action { get; set; }

        public Navigation(string from, string to) : this(from, to, _ => { })
        {
        }

        public Navigation(string from, string to, Action<Context<T>> action)
        {
            From = from;
            To = to;
            Action = action;
        }
    }

    public class BeforeEntering<T> : IFact<T>
    {
        public string State { get; private set; }
        public Action<Context<T>> Action { get; set; }

        public BeforeEntering(string state) : this(state, _ => { })
        {
        }

        public BeforeEntering(string state, Action<Context<T>> action)
        {
            State = state;
            Action = action;
        }
    }

    public class AfterEntering<T> : IFact<T>
    {
        public string State { get; private set; }
        public Action<Context<T>> Action { get; set; }

        public AfterEntering(string state) : this(state, _ => { })
        {
        }

        public AfterEntering(string state, Action<Context<T>> action)
        {
            State = state;
            Action = action;
        }
    }

    public class BeforeLeaving<T> : IFact<T>
    {
        public string State { get; private set; }
        public Action<Context<T>> Action { get; set; }

        public BeforeLeaving(string state) : this(state, _ => { })
        {
        }

        public BeforeLeaving(string state, Action<Context<T>> action)
        {
            State = state;
            Action = action;
        }
    }

    public class AfterLeaving<T> : IFact<T>
    {
        public string State { get; private set; }
        public Action<Context<T>> Action { get; set; }

        public AfterLeaving(string state) : this(state, _ => { })
        {
        }

        public AfterLeaving(string state, Action<Context<T>> action)
        {
            State = state;
            Action = action;
        }
    }
}
