using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StudentskaSluzba.Models
{
    [Table("govorilne_ure")]
    public class OfficeHour
    {
        [Key]
        public int id { get; set; }

        [Required]
        public DateTime zacetek { get; set; }

        public DateTime? konec { get; set; }

        [Required]
        public string uèilnica { get; set; } = string.Empty;

        [Required]
        public int Uporabnik_id { get; set; }

        public int? predmet_id { get; set; }

        public string? komentar_ucitelja { get; set; }

        [ForeignKey("Uporabnik_id")]
        public virtual User? Uporabnik { get; set; }

        [ForeignKey("predmet_id")]
        public virtual Subject? Predmet { get; set; }

        [JsonIgnore]
        public virtual ICollection<Reservation>? Rezervacije { get; set; }
    }
}