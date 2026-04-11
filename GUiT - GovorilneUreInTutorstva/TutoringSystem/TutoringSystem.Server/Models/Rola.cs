using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StudentskaSluzba.Models
{
    [Table("role")]
    public class Rola
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int Naziv { get; set; }

        [Required]
        public string Opis { get; set; } = string.Empty;

        [JsonIgnore]
        public virtual ICollection<User>? Uporabniki { get; set; }
    }
}