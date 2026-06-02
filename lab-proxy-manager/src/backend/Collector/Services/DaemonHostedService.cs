using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain.Models;
using Infrastructure.Repositories.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Collector.Services;

public class DaemonHostedService(
    DaemonState state,
    IServiceScopeFactory scopeFactory,
    ProxyChecker checker,
    IConfiguration config,
    ILogger<DaemonHostedService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalSec = config.GetValue("Daemon:IntervalSeconds", 60);
        var timeoutSec = config.GetValue("Daemon:TimeoutSeconds", 5);
        var maxParallel = config.GetValue("Daemon:MaxParallel", 20);
        var batchSize = config.GetValue("Daemon:BatchSize", 100);
        var testUrl = config["Daemon:TestUrl"] ?? "http://httpbin.org/ip";

        logger.LogInformation(
            "Daemon hosted service started. Interval={Interval}s, Timeout={Timeout}s, " +
            "Parallel={Parallel}, Batch={Batch}, TestUrl={Url}",
            intervalSec, timeoutSec, maxParallel, batchSize, testUrl
        );

        while (!stoppingToken.IsCancellationRequested)
        {
            if (!state.IsRunning)
            {
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                continue;
            }

            try
            {
                await RunIterationAsync(
                    testUrl, TimeSpan.FromSeconds(timeoutSec),
                    maxParallel, batchSize, stoppingToken
                );
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex)
            {
                logger.LogError(ex, "Daemon iteration failed");
            }

            try
            {
                await Task.Delay(TimeSpan.FromSeconds(intervalSec), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }

        logger.LogInformation("Daemon hosted service stopped");
    }

    private async Task RunIterationAsync(
        string testUrl, TimeSpan timeout, int maxParallel, int batchSize,
        CancellationToken ct)
    {
        var page = 1;
        var totalChecked = 0;

        while (!ct.IsCancellationRequested)
        {
            List<Proxy> proxies;
            int totalPages;

            using (var scope = scopeFactory.CreateScope())
            {
                var repo = scope.ServiceProvider.GetRequiredService<IProxyRepository>();
                var result = await repo.GetPageAsync(page, batchSize, status: null, protocol: null);
                proxies = result.Items;
                totalPages = (int)Math.Ceiling(result.TotalCount / (double)batchSize);
            }

            if (proxies.Count == 0) break;

            logger.LogInformation("Checking page {Page}/{Total} ({Count} proxies)", page, totalPages, proxies.Count);

            await Parallel.ForEachAsync(
                proxies,
                new ParallelOptions { MaxDegreeOfParallelism = maxParallel, CancellationToken = ct },
                async (proxy, pct) =>
                {
                    var result = await checker.CheckAsync(proxy, testUrl, timeout, pct);
                    proxy.ResponseTimeMs = result.ResponseTimeMs;
                    proxy.LastChecked = DateTime.UtcNow;

                    using var scope = scopeFactory.CreateScope();
                    var repo = scope.ServiceProvider.GetRequiredService<IProxyRepository>();
                    await repo.UpdateAsync(proxy);
                });

            totalChecked += proxies.Count;
            page++;

            if (page > totalPages) break;
        }

        logger.LogInformation("Iteration finished. Checked {Total} proxies", totalChecked);
    }
}
