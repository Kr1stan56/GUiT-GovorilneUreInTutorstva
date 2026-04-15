using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StudentskaSluzba.Models
{
    [Table("rezervacije_govorilne")]
    public class Reservation
    {
        [Key]
        public int id { get; set; }

        [Required]
        public int status { get; set; }

        [Required]
        public int Uporabnik_id { get; set; }

        [Required]
        public int govorilna_ura_id { get; set; }

        public string? komentar_studenta { get; set; }

        public string? komentar_ucitelja { get; set; }

        [ForeignKey("Uporabnik_id")]
        public virtual User? Uporabnik { get; set; }

        [ForeignKey("govorilna_ura_id")]
        public virtual OfficeHour? GovorilnaUra { get; set; }
    }
}