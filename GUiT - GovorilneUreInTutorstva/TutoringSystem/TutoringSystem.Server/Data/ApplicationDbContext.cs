using Microsoft.EntityFrameworkCore;
using StudentskaSluzba.Models;

namespace StudentskaSluzba.Data
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

            modelBuilder.Entity<User>().ToTable("Uporabniki");
            modelBuilder.Entity<Rola>().ToTable("role");
            modelBuilder.Entity<Subject>().ToTable("predmeti");
            modelBuilder.Entity<Tutor>().ToTable("tutor_predmeti");
            modelBuilder.Entity<OfficeHour>().ToTable("govorilne_ure");
            modelBuilder.Entity<Reservation>().ToTable("rezervacije_govorilne");
        }
    }
}