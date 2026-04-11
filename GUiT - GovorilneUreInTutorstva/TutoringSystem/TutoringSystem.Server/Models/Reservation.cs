using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StudentskaSluzba.Models
{
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
    }
}