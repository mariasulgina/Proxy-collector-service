using Microsoft.EntityFrameworkCore;
using Domain.Models;

namespace Infrastructure.Context;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Proxy> Proxies { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Proxy>()
            .HasIndex(p => new { p.Ip, p.Port })
            .IsUnique();
    }
}
