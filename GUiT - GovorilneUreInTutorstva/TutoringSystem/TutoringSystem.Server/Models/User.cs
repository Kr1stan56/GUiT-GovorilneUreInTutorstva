using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StudentskaSluzba.Models
{
    [Table("Uporabniki")]
    public class User
    {
        [Key]
        public int id { get; set; }

        [Required]
        public string ime { get; set; } = string.Empty;

        [Required]
        public string priimek { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string email { get; set; } = string.Empty;

        [Required]
        public string geslo_hash { get; set; } = string.Empty;

        [Required]
        public int rola_id { get; set; }

        [ForeignKey("rola_id")]
        public virtual Rola? Rola { get; set; }

        public decimal? urna_postavka { get; set; }

        [JsonIgnore]
        public virtual ICollection<Tutor>? TutorPredmeti { get; set; }

        [JsonIgnore]
        public virtual ICollection<OfficeHour>? GovorilneUre { get; set; }

        [JsonIgnore]
        public virtual ICollection<Reservation>? Rezervacije { get; set; }
    }
}