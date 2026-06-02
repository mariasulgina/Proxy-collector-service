using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Collector.Services.Validators;

public interface IProxyValidator
{
    string TestUrl { get; }

    Task<bool> ValidateAsync(HttpResponseMessage response, CancellationToken token);
}
