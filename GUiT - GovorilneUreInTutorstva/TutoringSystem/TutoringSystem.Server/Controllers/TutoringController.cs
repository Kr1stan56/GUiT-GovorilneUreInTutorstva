using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using TutoringSystem.Server.Models;

namespace TutoringSystem.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TutoringController : ControllerBase
    {
        // Mock podatki
        private static List<OfficeHour> officeHours = new()
        {
            new OfficeHour
            {
                Id = 1,
                ProfessorName = "Dr. Novak",
                ProfessorId = 1,
                Subject = "Programiranje",
                DateTime = "2026-04-15T10:00",
                Location = "Zoom",
                MaxStudents = 5,
                Enrolled = 2,
                Students = new List<int> { 2, 3 }
            },
            new OfficeHour
            {
                Id = 2,
                ProfessorName = "Dr. Horvat",
                ProfessorId = 2,
                Subject = "Baze podatkov",
                DateTime = "2026-04-16T14:00",
                Location = "R2-12",
                MaxStudents = 3,
                Enrolled = 1,
                Students = new List<int> { 4 }
            }
        };

        private static List<Tutor> tutors = new()
        {
            new Tutor
            {
                Id = 1,
                Name = "Luka M.",
                StudentId = 5,
                Subject = "Programiranje",
                Description = "Pomoè pri Javi, Python",
                Price = 15,
                Email = "luka@student.com",
                Rating = 4.8,
                Reviews = 12
            },
            new Tutor
            {
                Id = 2,
                Name = "Ana K.",
                StudentId = 6,
                Subject = "Matematika",
                Description = "Vsa poglavja",
                Price = 12,
                Email = "ana@student.com",
                Rating = 4.9,
                Reviews = 8
            }
        };

        private static List<User> users = new()
        {
            new User { Id = 1, Name = "Admin User", Email = "admin@tutorhub.com", Password = "admin123", Role = "admin" },
            new User { Id = 2, Name = "Prof. Janez Novak", Email = "profesor@faks.si", Password = "prof123", Role = "professor" },
            new User { Id = 3, Name = "Luka M.", Email = "luka@student.com", Password = "student123", Role = "tutor" },
            new User { Id = 4, Name = "Ana K.", Email = "ana@student.com", Password = "student123", Role = "student" }
        };

        // GET: api/tutoring/officehours
        [HttpGet("officehours")]
        public IActionResult GetOfficeHours()
        {
            return Ok(officeHours);
        }

        // POST: api/tutoring/officehours
        [HttpPost("officehours")]
        public IActionResult CreateOfficeHour([FromBody] OfficeHour officeHour)
        {
            officeHour.Id = officeHours.Max(o => o.Id) + 1;
            officeHours.Add(officeHour);
            return Ok(officeHour);
        }

        // PUT: api/tutoring/officehours/5
        [HttpPut("officehours/{id}")]
        public IActionResult UpdateOfficeHour(int id, [FromBody] OfficeHour officeHour)
        {
            var existing = officeHours.FirstOrDefault(o => o.Id == id);
            if (existing == null)
                return NotFound();

            var index = officeHours.IndexOf(existing);
            officeHour.Id = id;
            officeHours[index] = officeHour;
            return Ok(officeHour);
        }

        // DELETE: api/tutoring/officehours/5
        [HttpDelete("officehours/{id}")]
        public IActionResult DeleteOfficeHour(int id)
        {
            var officeHour = officeHours.FirstOrDefault(o => o.Id == id);
            if (officeHour == null)
                return NotFound();

            officeHours.Remove(officeHour);
            return Ok();
        }

        // GET: api/tutoring/tutors
        [HttpGet("tutors")]
        public IActionResult GetTutors()
        {
            return Ok(tutors);
        }

        // POST: api/tutoring/login
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = users.FirstOrDefault(u => u.Email == request.Email && u.Password == request.Password);
            if (user == null)
                return Unauthorized(new { message = "Invalid email or password" });

            return Ok(new { user.Id, user.Name, user.Email, user.Role });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}