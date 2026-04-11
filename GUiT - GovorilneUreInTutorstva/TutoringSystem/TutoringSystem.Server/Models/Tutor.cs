using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using TutoringSystem.Server.Models;

namespace StudentskaSluzba.Models
{
    [Table("tutor_predmeti")]
    public class Tutor
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [Column("predmet_id")]
        public int PredmetId { get; set; }

        [Required]
        [Column("Uporabniki_id")]
        public int UserId { get; set; }

        // Navigacijske lastnosti
        [ForeignKey("PredmetId")]
        public virtual Subject Predmet { get; set; }

        [ForeignKey("UserId")]
        public virtual User Uporabnik { get; set; }
    }

    [Table("predmeti")]
    public class Subject
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public string Naziv { get; set; }

        public string Opis { get; set; }

        [JsonIgnore]
        public virtual ICollection<Tutor> Tutorji { get; set; }

        [JsonIgnore]
        public virtual ICollection<OfficeHour> GovorilneUre { get; set; }
    }
}