namespace TutoringSystem.Server.Models
{
    public class OfficeHour
    {
        public int Id { get; set; }
        public string ProfessorName { get; set; } = string.Empty;
        public int ProfessorId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string DateTime { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public int MaxStudents { get; set; }
        public int Enrolled { get; set; }
        public List<int> Students { get; set; } = new List<int>();
    }
}