using System;
using System.Collections.Generic;
using System.Reflection;
using System.Linq;
using System.Threading.Tasks;

namespace Theseus
{
    public class NavigationAttribute : Attribute
    {
        public string From { get; private set; }
        public string To { get; private set; }

        public NavigationAttribute(string from, string to)
        {
            From = from;
            To = to;
        }
    }

    public class AfterEnteringAttribute : Attribute
    {
        public string State { get; private set; }

        public AfterEnteringAttribute(string state)
        {
            State = state;
        }
    }

    public class BeforeEnteringAttribute : Attribute
    {
        public string State { get; private set; }

        public BeforeEnteringAttribute(string state)
        {
            State = state;
        }
    }

    public class AfterLeavingAttribute : Attribute
    {
        public string State { get; private set; }

        public AfterLeavingAttribute(string state)
        {
            State = state;
        }
    }

    public class BeforeLeavingAttribute : Attribute
    {
        public string State { get; private set; }

        public BeforeLeavingAttribute(string state)
        {
            State = state;
        }
    }

    public class FactFinder
    {
        public IEnumerable<IFact<T>> FindFacts<T>(Assembly assembly)
        {
            var facts = new List<IFact<T>>();

            foreach (var type in assembly.GetTypes())
                facts.AddRange(FindFacts<T>(type));

            return facts;
        }

        public IEnumerable<IFact<T>> FindFacts<T>(Type type)
        {
            var facts = new List<IFact<T>>();

            foreach (var method in type.GetMethods().Where(m => m.GetParameters().Length == 1))
            {
                Handle<T, NavigationAttribute>(type, method,
                    (attribute, instance) => facts.Add(Navigation<T>.WithAction(attribute.From, attribute.To, context => method.Invoke(instance, new object[] { context }))),
                    (attribute, instance) => facts.Add(Navigation<T>.WithAction(attribute.From, attribute.To, context => method.Invoke(instance, new object[] { context.State }))),
                    (attribute, instance) => facts.Add(Navigation<T>.WithAsyncFunc(attribute.From, attribute.To, context => (Task)method.Invoke(instance, new object[] { context }))),
                    (attribute, instance) => facts.Add(Navigation<T>.WithAsyncFunc(attribute.From, attribute.To, context => (Task)method.Invoke(instance, new object[] { context.State }))));

                Handle<T, AfterEnteringAttribute>(type, method,
                    (attribute, instance) => facts.Add(AfterEntering<T>.WithAction(attribute.State, context => method.Invoke(instance, new object[] { context }))),
                    (attribute, instance) => facts.Add(AfterEntering<T>.WithAction(attribute.State, context => method.Invoke(instance, new object[] { context.State }))),
                    (attribute, instance) => facts.Add(AfterEntering<T>.WithAsyncFunc(attribute.State, context => (Task)method.Invoke(instance, new object[] { context }))),
                    (attribute, instance) => facts.Add(AfterEntering<T>.WithAsyncFunc(attribute.State, context => (Task)method.Invoke(instance, new object[] { context.State }))));

                Handle<T, BeforeEnteringAttribute>(type, method,
                    (attribute, instance) => facts.Add(BeforeEntering<T>.WithAction(attribute.State, context => method.Invoke(instance, new object[] { context }))),
                    (attribute, instance) => facts.Add(BeforeEntering<T>.WithAction(attribute.State, context => method.Invoke(instance, new object[] { context.State }))),
                    (attribute, instance) => facts.Add(BeforeEntering<T>.WithAsyncFunc(attribute.State, context => (Task)method.Invoke(instance, new object[] { context }))),
                    (attribute, instance) => facts.Add(BeforeEntering<T>.WithAsyncFunc(attribute.State, context => (Task)method.Invoke(instance, new object[] { context.State }))));

                Handle<T, AfterLeavingAttribute>(type, method,
                    (attribute, instance) => facts.Add(AfterLeaving<T>.WithAction(attribute.State, context => method.Invoke(instance, new object[] { context }))),
                    (attribute, instance) => facts.Add(AfterLeaving<T>.WithAction(attribute.State, context => method.Invoke(instance, new object[] { context.State }))),
                    (attribute, instance) => facts.Add(AfterLeaving<T>.WithAsyncFunc(attribute.State, context => (Task)method.Invoke(instance, new object[] { context }))),
                    (attribute, instance) => facts.Add(AfterLeaving<T>.WithAsyncFunc(attribute.State, context => (Task)method.Invoke(instance, new object[] { context.State }))));

                Handle<T, BeforeLeavingAttribute>(type, method,
                    (attribute, instance) => facts.Add(BeforeLeaving<T>.WithAction(attribute.State, context => method.Invoke(instance, new object[] { context }))),
                    (attribute, instance) => facts.Add(BeforeLeaving<T>.WithAction(attribute.State, context => method.Invoke(instance, new object[] { context.State }))),
                    (attribute, instance) => facts.Add(BeforeLeaving<T>.WithAsyncFunc(attribute.State, context => (Task)method.Invoke(instance, new object[] { context }))),
                    (attribute, instance) => facts.Add(BeforeLeaving<T>.WithAsyncFunc(attribute.State, context => (Task)method.Invoke(instance, new object[] { context.State }))));
            }

            return facts;
        }

        private void Handle<T,A>(Type type, MethodInfo method,
                Action<A, object> withContext,
                Action<A, object> withoutContext,
                Action<A, object> asyncWithContext,
                Action<A, object> asyncWithoutContext)
            where A : Attribute
        {
            var innerParameterType = typeof(T);
            var contextParameterType = typeof(Context<T>);

            if (method.GetCustomAttributes(typeof(A), false).Length > 0)
            {
                if (method.ReturnType == typeof(Task))
                {
                    if (method.GetParameters().First().ParameterType == contextParameterType)
                    {
                        var instance = type.GetConstructor(new Type[0]).Invoke(new object[0]);
                        var attribute = method.GetCustomAttribute(typeof(A), false) as A;
                        asyncWithContext(attribute, instance);
                    }
                    else if (method.GetParameters().First().ParameterType == innerParameterType)
                    {
                        var instance = type.GetConstructor(new Type[0]).Invoke(new object[0]);
                        var attribute = method.GetCustomAttribute(typeof(A), false) as A;
                        asyncWithoutContext(attribute, instance);
                    }
                }
                else
                {
                    if (method.GetParameters().First().ParameterType == contextParameterType)
                    {
                        var instance = type.GetConstructor(new Type[0]).Invoke(new object[0]);
                        var attribute = method.GetCustomAttribute(typeof(A), false) as A;
                        withContext(attribute, instance);
                    }
                    else if (method.GetParameters().First().ParameterType == innerParameterType)
                    {
                        var instance = type.GetConstructor(new Type[0]).Invoke(new object[0]);
                        var attribute = method.GetCustomAttribute(typeof(A), false) as A;
                        withoutContext(attribute, instance);
                    }
                }
            }
        }
    }
}
