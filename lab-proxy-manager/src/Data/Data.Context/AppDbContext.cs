using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Data.Models;

namespace Data.Context;

public class AppDbContext : DbContext
{
    public DbSet<ProxyNode> Proxies { get; set; } = null!;
    public DbSet<ProxyPackage> Packages { get; set; } = null!;
    
    public AppDbContext() { }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .Build();

        var connectionString = configuration.GetConnectionString("PostgresConnection");

        optionsBuilder.UseNpgsql(connectionString);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ProxyNode>()
            .HasOne(e => e.Package)
            .WithMany(e => e.Proxies)
            .HasForeignKey(e => e.PackageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
