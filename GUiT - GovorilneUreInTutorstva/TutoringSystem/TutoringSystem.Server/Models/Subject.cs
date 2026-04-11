using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StudentskaSluzba.Models
{
    [Table("predmeti")]
    public class Subject
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public string Naziv { get; set; } = string.Empty;

        public string? Opis { get; set; }

        [JsonIgnore]
        public virtual ICollection<Tutor>? Tutorji { get; set; }

        [JsonIgnore]
        public virtual ICollection<OfficeHour>? GovorilneUre { get; set; }
    }
}