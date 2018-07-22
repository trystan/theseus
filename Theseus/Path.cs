using System.Collections.Generic;

namespace Theseus
{
    public class Path<T>
    {
        public List<IFact<T>> Facts { get; private set; }

        public Path() : this(new List<IFact<T>>())
        {
        }

        public Path(List<IFact<T>> facts)
        {
            Facts = facts;
        }
    }
}
