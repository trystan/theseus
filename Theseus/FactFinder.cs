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
        public string[] Requires { get; set; } = new string[0];

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

    public interface ILabelMaker
    {
        string MakeLabel(MethodInfo method);
    }

    public class DefaultLabelmaker : ILabelMaker
    {
        public string MakeLabel(MethodInfo method)
        {
            var label = "";
            foreach (var c in method.Name.Replace('_', ' '))
            {
                if (char.IsUpper(c) && (label.Length == 0 || !char.IsUpper(label.Last())))
                    label += ' ';
                
                label += c;
            }
            var words = label.Split(' ');
            label = "";
            foreach (var word in words)
            {
                if (label == "")
                    label = word;
                else if (word.All(char.IsUpper))
                    label += " " + word;
                else
                    label += " " + word.ToLower();
            }
            return label.Trim();
        }
    }

    public class FactFinder
    {
        private readonly ILabelMaker _labelMaker;

        public FactFinder(ILabelMaker labelMaker)
        {
            _labelMaker = labelMaker;
        }

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
                Handle<T, NavigationAttribute>(facts, type, method,
                    (attribute, instance) => Navigation<T>.WithAction(attribute.From, attribute.To, context => method.Invoke(instance, new object[] { context }), attribute.Requires),
                    (attribute, instance) => Navigation<T>.WithAction(attribute.From, attribute.To, context => method.Invoke(instance, new object[] { context.State }), attribute.Requires),
                    (attribute, instance) => Navigation<T>.WithAsyncFunc(attribute.From, attribute.To, context => (Task)method.Invoke(instance, new object[] { context }), attribute.Requires),
                    (attribute, instance) => Navigation<T>.WithAsyncFunc(attribute.From, attribute.To, context => (Task)method.Invoke(instance, new object[] { context.State }), attribute.Requires));

                Handle<T, AfterEnteringAttribute>(facts, type, method,
                    (attribute, instance) => AfterEntering<T>.WithAction(attribute.State, context => method.Invoke(instance, new object[] { context })),
                    (attribute, instance) => AfterEntering<T>.WithAction(attribute.State, context => method.Invoke(instance, new object[] { context.State })),
                    (attribute, instance) => AfterEntering<T>.WithAsyncFunc(attribute.State, context => (Task)method.Invoke(instance, new object[] { context })),
                    (attribute, instance) => AfterEntering<T>.WithAsyncFunc(attribute.State, context => (Task)method.Invoke(instance, new object[] { context.State })));

                Handle<T, BeforeEnteringAttribute>(facts, type, method,
                    (attribute, instance) => BeforeEntering<T>.WithAction(attribute.State, context => method.Invoke(instance, new object[] { context })),
                    (attribute, instance) => BeforeEntering<T>.WithAction(attribute.State, context => method.Invoke(instance, new object[] { context.State })),
                    (attribute, instance) => BeforeEntering<T>.WithAsyncFunc(attribute.State, context => (Task)method.Invoke(instance, new object[] { context })),
                    (attribute, instance) => BeforeEntering<T>.WithAsyncFunc(attribute.State, context => (Task)method.Invoke(instance, new object[] { context.State })));

                Handle<T, AfterLeavingAttribute>(facts, type, method,
                    (attribute, instance) => AfterLeaving<T>.WithAction(attribute.State, context => method.Invoke(instance, new object[] { context })),
                    (attribute, instance) => AfterLeaving<T>.WithAction(attribute.State, context => method.Invoke(instance, new object[] { context.State })),
                    (attribute, instance) => AfterLeaving<T>.WithAsyncFunc(attribute.State, context => (Task)method.Invoke(instance, new object[] { context })),
                    (attribute, instance) => AfterLeaving<T>.WithAsyncFunc(attribute.State, context => (Task)method.Invoke(instance, new object[] { context.State })));

                Handle<T, BeforeLeavingAttribute>(facts, type, method,
                    (attribute, instance) => BeforeLeaving<T>.WithAction(attribute.State, context => method.Invoke(instance, new object[] { context })),
                    (attribute, instance) => BeforeLeaving<T>.WithAction(attribute.State, context => method.Invoke(instance, new object[] { context.State })),
                    (attribute, instance) => BeforeLeaving<T>.WithAsyncFunc(attribute.State, context => (Task)method.Invoke(instance, new object[] { context })),
                    (attribute, instance) => BeforeLeaving<T>.WithAsyncFunc(attribute.State, context => (Task)method.Invoke(instance, new object[] { context.State })));
            }

            return facts;
        }

        private void Handle<T,A>(List<IFact<T>> facts, Type type, MethodInfo method,
                Func<A, object, IFact<T>> withContext,
                Func<A, object, IFact<T>> withoutContext,
                Func<A, object, IFact<T>> asyncWithContext,
                Func<A, object, IFact<T>> asyncWithoutContext)
            where A : Attribute
        {
            var innerParameterType = typeof(T);
            var contextParameterType = typeof(Context<T>);
            var label = _labelMaker.MakeLabel(method);

            foreach (A attribute in method.GetCustomAttributes(typeof(A), false))
            {
                var instance = type.GetConstructor(new Type[0]).Invoke(new object[0]);
                var parameterType = method.GetParameters().First().ParameterType;

                if (method.ReturnType == typeof(Task))
                {
                    if (parameterType == contextParameterType)
                    {
                        var fact = asyncWithContext(attribute, instance);
                        fact.Label = label;
                        facts.Add(fact);
                    }
                    else if (parameterType == innerParameterType)
                    {
                        var fact = asyncWithoutContext(attribute, instance);
                        fact.Label = label;
                        facts.Add(fact);
                    }
                }
                else
                {
                    if (parameterType == contextParameterType)
                    {
                        var fact = withContext(attribute, instance);
                        fact.Label = label;
                        facts.Add(fact);
                    }
                    else if (parameterType == innerParameterType)
                    {
                        var fact = withoutContext(attribute, instance);
                        fact.Label = label;
                        facts.Add(fact);
                    }
                }
            }
        }
    }
}
