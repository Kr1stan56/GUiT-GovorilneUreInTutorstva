using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using TutoringSystem.Server.Models;

namespace StudentskaSluzba.Models
{
    [Table("Uporabniki")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public string Ime { get; set; }

        [Required]
        public string Priimek { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [Column("geslo_hash")]
        public string GesloHash { get; set; }

        [Required]
        [Column("rola_id")]
        public int RolaId { get; set; }

        [ForeignKey("RolaId")]
        public virtual Rola Rola { get; set; }

        // Navigacijske lastnosti
        [JsonIgnore]
        public virtual ICollection<Tutor> TutorPredmeti { get; set; }

        [JsonIgnore]
        public virtual ICollection<OfficeHour> GovorilneUre { get; set; }

        [JsonIgnore]
        public virtual ICollection<Reservation> Rezervacije { get; set; }

        // Property za polno ime
        [NotMapped]
        public string PolnoIme => $"{Ime} {Priimek}";
    }

    [Table("role")]
    public class Rola
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int Naziv { get; set; }

        [Required]
        public string Opis { get; set; }

        [JsonIgnore]
        public virtual ICollection<User> Uporabniki { get; set; }
    }
}