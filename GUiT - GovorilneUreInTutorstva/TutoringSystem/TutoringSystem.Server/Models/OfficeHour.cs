using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace TutoringSystem.Server.Models
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
        public virtual ICollection<Reservation> Rezervacije { get; set; } = new List<Reservation>();

        [NotMapped]
        public bool IsActive => Konec == null || Konec > DateTime.Now;

        [NotMapped]
        public int AvailableSpots => 10 - (Rezervacije?.Count(r => r.Status == 1) ?? 0);
    }

    [Table("rezervacije_govorilne")]
    public class Reservation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int Status { get; set; }

        [Required]
        [Column("Uporabnik_id")]
        public int UserId { get; set; }

        [Required]
        [Column("govorilna_ura_id")]
        public int OfficeHourId { get; set; }

        [ForeignKey("UserId")]
        public virtual User? Uporabnik { get; set; }

        [ForeignKey("OfficeHourId")]
        public virtual OfficeHour? GovorilnaUra { get; set; }

        [NotMapped]
        public string StatusOpis
        {
            get
            {
                return Status switch
                {
                    0 => "Èaka na potrditev",
                    1 => "Potrjeno",
                    2 => "Preklicano",
                    3 => "Opravljeno",
                    _ => "Neznan status"
                };
            }
        }
    }
}