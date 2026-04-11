using Microsoft.EntityFrameworkCore;
using TutoringSystem.Server.Models;

namespace TutoringSystem.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Rola> Roles { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<Tutor> TutorSubjects { get; set; }
        public DbSet<OfficeHour> OfficeHours { get; set; }
        public DbSet<Reservation> Reservations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Unikatni email
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Unikatna kombinacija za Tutor
            modelBuilder.Entity<Tutor>()
                .HasIndex(t => new { t.UserId, t.PredmetId })
                .IsUnique();

            // Relacije
            modelBuilder.Entity<Tutor>()
                .HasOne(t => t.Uporabnik)
                .WithMany(u => u.TutorPredmeti)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Tutor>()
                .HasOne(t => t.Predmet)
                .WithMany(p => p.Tutorji)
                .HasForeignKey(t => t.PredmetId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OfficeHour>()
                .HasOne(o => o.Uporabnik)
                .WithMany(u => u.GovorilneUre)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Uporabnik)
                .WithMany(u => u.Rezervacije)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}