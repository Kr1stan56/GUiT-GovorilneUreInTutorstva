using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StudentskaSluzba.Models
{
    [Table("Uporabniki")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public string Ime { get; set; } = string.Empty;

        [Required]
        public string Priimek { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("geslo_hash")]
        public string GesloHash { get; set; } = string.Empty;

        [Required]
        [Column("rola_id")]
        public int RolaId { get; set; }

        [ForeignKey("RolaId")]
        public virtual Rola? Rola { get; set; }

        [NotMapped]
        public string PolnoIme => $"{Ime} {Priimek}";

        [JsonIgnore]
        public virtual ICollection<Tutor>? TutorPredmeti { get; set; }

        [JsonIgnore]
        public virtual ICollection<OfficeHour>? GovorilneUre { get; set; }

        [JsonIgnore]
        public virtual ICollection<Reservation>? Rezervacije { get; set; }
    }
}