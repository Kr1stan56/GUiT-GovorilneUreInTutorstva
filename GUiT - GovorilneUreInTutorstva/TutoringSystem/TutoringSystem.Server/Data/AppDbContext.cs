using Microsoft.EntityFrameworkCore;
using TutoringSystem.Server.Models;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Tutor> Tutors => Set<Tutor>();
    public DbSet<OfficeHour> OfficeHours => Set<OfficeHour>();
}