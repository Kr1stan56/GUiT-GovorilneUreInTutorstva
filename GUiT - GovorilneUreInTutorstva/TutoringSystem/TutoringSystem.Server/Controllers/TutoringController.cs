using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentskaSluzba.Data;
using StudentskaSluzba.Models;

namespace StudentskaSluzba.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TutoringController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TutoringController(ApplicationDbContext context)
        {
            _context = context;
        }

        // TEST endpoint
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "Backend dela!", timestamp = DateTime.Now });
        }

        // ========== PRIJAVA (LOGIN) ==========
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .Include(u => u.Rola)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                return Unauthorized(new { message = "Email ali geslo je napaèno" });

            // Za testiranje - primerjava direktno (brez hash-a)
            if (user.GesloHash != request.Password)
                return Unauthorized(new { message = "Email ali geslo je napaèno" });

            return Ok(new
            {
                id = user.Id,
                name = $"{user.Ime} {user.Priimek}",
                email = user.Email,
                role = GetRoleName(user.RolaId),
                token = "test-token"
            });
        }

        // ========== GOVORILNE URE ==========
        [HttpGet("officehours")]
        public async Task<IActionResult> GetOfficeHours()
        {
            var officeHours = await _context.OfficeHours
                .Include(o => o.Uporabnik)
                .Include(o => o.Predmet)
                .ToListAsync();
            return Ok(officeHours);
        }

        [HttpPost("officehours")]
        public async Task<IActionResult> CreateOfficeHour([FromBody] OfficeHour officeHour)
        {
            _context.OfficeHours.Add(officeHour);
            await _context.SaveChangesAsync();
            return Ok(officeHour);
        }

        [HttpPut("officehours/{id}")]
        public async Task<IActionResult> UpdateOfficeHour(int id, [FromBody] OfficeHour officeHour)
        {
            var existing = await _context.OfficeHours.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Zacetek = officeHour.Zacetek;
            existing.Konec = officeHour.Konec;
            existing.Uèilnica = officeHour.Uèilnica;
            existing.PredmetId = officeHour.PredmetId;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("officehours/{id}")]
        public async Task<IActionResult> DeleteOfficeHour(int id)
        {
            var officeHour = await _context.OfficeHours.FindAsync(id);
            if (officeHour == null) return NotFound();

            _context.OfficeHours.Remove(officeHour);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("officehours/{id}/enroll")]
        public async Task<IActionResult> EnrollStudent(int id, [FromBody] int studentId)
        {
            // Implementacija prijave študenta
            var officeHour = await _context.OfficeHours.FindAsync(id);
            if (officeHour == null) return NotFound();

            // Tukaj dodaj logiko za prijavo
            return Ok(officeHour);
        }

        [HttpPost("officehours/{id}/cancel")]
        public async Task<IActionResult> CancelEnrollment(int id, [FromBody] int studentId)
        {
            var officeHour = await _context.OfficeHours.FindAsync(id);
            if (officeHour == null) return NotFound();

            // Tukaj dodaj logiko za preklic
            return Ok(officeHour);
        }

        // ========== TUTORJI ==========
        [HttpGet("tutors")]
        public async Task<IActionResult> GetTutors()
        {
            var tutors = await _context.Users
                .Where(u => u.RolaId == 2) // Tutorji
                .Select(u => new
                {
                    u.Id,
                    u.Ime,
                    u.Priimek,
                    name = $"{u.Ime} {u.Priimek}",
                    u.Email,
                    subject = "Programiranje",
                    description = "Pomoè pri uèenju",
                    price = 15,
                    rating = 4.5,
                    reviews = 10
                })
                .ToListAsync();
            return Ok(tutors);
        }

        [HttpPut("tutors/{id}")]
        public async Task<IActionResult> UpdateTutor(int id, [FromBody] object data)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            // Tukaj dodaj logiko za posodobitev tutorja
            return Ok(user);
        }

        [HttpDelete("tutors/{id}")]
        public async Task<IActionResult> DeleteTutor(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ========== POMOŽNE FUNKCIJE ==========
        private string GetRoleName(int roleId)
        {
            return roleId switch
            {
                1 => "admin",
                2 => "tutor",
                3 => "student",
                4 => "professor",
                _ => "student"
            };
        }
    }

    // Model za prijavo
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}