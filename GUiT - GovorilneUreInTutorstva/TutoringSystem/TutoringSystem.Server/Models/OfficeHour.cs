using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StudentskaSluzba.Models
{
    [Table("govorilne_ure")]
    public class OfficeHour
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public DateTime Zacetek { get; set; }

        public DateTime? Konec { get; set; }

        [Required]
        public int Uèilnica { get; set; }

        [Required]
        [Column("Uporabnik_id")]
        public int UserId { get; set; }

        [Column("predmet_id")]
        public int? PredmetId { get; set; }

        [ForeignKey("UserId")]
        public virtual User? Uporabnik { get; set; }

        [ForeignKey("PredmetId")]
        public virtual Subject? Predmet { get; set; }

        [JsonIgnore]
        public virtual ICollection<Reservation>? Rezervacije { get; set; }
    }
}