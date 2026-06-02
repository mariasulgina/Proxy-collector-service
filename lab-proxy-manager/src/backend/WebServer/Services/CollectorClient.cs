namespace WebServer.Services;

public class CollectorClient(HttpClient http)
{
    public async Task<bool> PingAsync()
    {
        try
        {
            var response = await http.GetAsync("/ping");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    public async Task<string> GetDaemonStatusAsync()
    {
        var response = await http.GetAsync("/daemon/status");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }

    public async Task StartDaemonAsync()
    {
        var response = await http.PostAsync("/daemon/start", null);
        response.EnsureSuccessStatusCode();
    }

    public async Task StopDaemonAsync()
    {
        var response = await http.PostAsync("/daemon/stop", null);
        response.EnsureSuccessStatusCode();
    }
}
