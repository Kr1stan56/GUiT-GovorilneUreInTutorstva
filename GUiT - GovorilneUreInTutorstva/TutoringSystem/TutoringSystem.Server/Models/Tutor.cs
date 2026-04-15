using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StudentskaSluzba.Models
{
    [Table("tutor_predmeti")]
    public class Tutor
    {
        [Key]
        public int id { get; set; }

        [Required]
        public int predmet_id { get; set; }

        [Required]
        public int Uporabniki_id { get; set; }

        [ForeignKey("predmet_id")]
        public virtual Subject? Predmet { get; set; }

        [ForeignKey("Uporabniki_id")]
        public virtual User? Uporabnik { get; set; }
    }
}