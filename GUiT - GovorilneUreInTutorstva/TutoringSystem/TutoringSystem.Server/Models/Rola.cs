using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StudentskaSluzba.Models
{
    [Table("role")]
    public class Rola
    {
        [Key]
        public int id { get; set; }

        [Required]
        public int naziv { get; set; }

        [Required]
        public string opis { get; set; } = string.Empty;

        [JsonIgnore]
        public virtual ICollection<User>? Uporabniki { get; set; }
    }
}