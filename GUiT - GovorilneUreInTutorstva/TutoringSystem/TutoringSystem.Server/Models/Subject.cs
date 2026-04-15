using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StudentskaSluzba.Models
{
    [Table("predmeti")]
    public class Subject
    {
        [Key]
        public int id { get; set; }

        [Required]
        public string naziv { get; set; } = string.Empty;

        public string? opis { get; set; }

        [JsonIgnore]
        public virtual ICollection<Tutor>? Tutorji { get; set; }

        [JsonIgnore]
        public virtual ICollection<OfficeHour>? GovorilneUre { get; set; }
    }
}