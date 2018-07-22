namespace Theseus
{
    public class Context<T>
    {
        public Path<T> Path { get; private set; }
        public T State { get; set; }
    
        public Context()
        {
            Path = new Path<T>();
        }
    }
}
