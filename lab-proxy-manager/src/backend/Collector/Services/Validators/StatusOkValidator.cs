using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Collector.Services.Validators;

public class StatusOkValidator : IProxyValidator
{
    public string TestUrl => "https://www.google.com/humans.txt";

    public Task<bool> ValidateAsync(HttpResponseMessage response, CancellationToken token)
    {
        return Task.FromResult(response.IsSuccessStatusCode);
    }
}
