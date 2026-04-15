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

            // User
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Uporabniki");
                entity.HasKey(e => e.id);
                entity.Property(e => e.id).HasColumnName("id");
                entity.Property(e => e.ime).HasColumnName("ime");
                entity.Property(e => e.priimek).HasColumnName("priimek");
                entity.Property(e => e.email).HasColumnName("email");
                entity.Property(e => e.geslo_hash).HasColumnName("geslo_hash");
                entity.Property(e => e.rola_id).HasColumnName("rola_id");
                entity.Property(e => e.urna_postavka).HasColumnName("urna_postavka");
            });

            // Rola
            modelBuilder.Entity<Rola>(entity =>
            {
                entity.ToTable("role");
                entity.HasKey(e => e.id);
                entity.Property(e => e.id).HasColumnName("id");
                entity.Property(e => e.naziv).HasColumnName("naziv");
                entity.Property(e => e.opis).HasColumnName("opis");
            });

            // Subject
            modelBuilder.Entity<Subject>(entity =>
            {
                entity.ToTable("predmeti");
                entity.HasKey(e => e.id);
                entity.Property(e => e.id).HasColumnName("id");
                entity.Property(e => e.naziv).HasColumnName("naziv");
                entity.Property(e => e.opis).HasColumnName("opis");
            });

            // Tutor
            modelBuilder.Entity<Tutor>(entity =>
            {
                entity.ToTable("tutor_predmeti");
                entity.HasKey(e => e.id);
                entity.Property(e => e.id).HasColumnName("id");
                entity.Property(e => e.predmet_id).HasColumnName("predmet_id");
                entity.Property(e => e.Uporabniki_id).HasColumnName("Uporabniki_id");
            });

            // OfficeHour
            modelBuilder.Entity<OfficeHour>(entity =>
            {
                entity.ToTable("govorilne_ure");
                entity.HasKey(e => e.id);
                entity.Property(e => e.id).HasColumnName("id");
                entity.Property(e => e.zacetek).HasColumnName("zacetek");
                entity.Property(e => e.konec).HasColumnName("konec");
                entity.Property(e => e.učilnica).HasColumnName("učilnica");
                entity.Property(e => e.Uporabnik_id).HasColumnName("Uporabnik_id");
                entity.Property(e => e.predmet_id).HasColumnName("predmet_id");
                entity.Property(e => e.komentar_ucitelja).HasColumnName("komentar_ucitelja");
            });

            // Reservation
            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.ToTable("rezervacije_govorilne");
                entity.HasKey(e => e.id);
                entity.Property(e => e.id).HasColumnName("id");
                entity.Property(e => e.status).HasColumnName("status");
                entity.Property(e => e.Uporabnik_id).HasColumnName("Uporabnik_id");
                entity.Property(e => e.govorilna_ura_id).HasColumnName("govorilna_ura_id");
                entity.Property(e => e.komentar_studenta).HasColumnName("komentar_studenta");
                entity.Property(e => e.komentar_ucitelja).HasColumnName("komentar_ucitelja");
            });
        }
    }
}