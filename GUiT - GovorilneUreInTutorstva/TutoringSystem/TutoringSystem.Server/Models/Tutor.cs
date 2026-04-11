namespace TutoringSystem.Server.Models
{
    public class Tutor
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int StudentId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Email { get; set; } = string.Empty;
        public double Rating { get; set; }
        public int Reviews { get; set; }
    }
}