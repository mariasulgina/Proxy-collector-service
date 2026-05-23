namespace Collector.Services;

public class DaemonState
{
    private readonly object _lock = new();
    private bool _isRunning;

    public bool IsRunning
    {
        get { lock (_lock) return _isRunning; }
        set { lock (_lock) _isRunning = value; }
    }
}
