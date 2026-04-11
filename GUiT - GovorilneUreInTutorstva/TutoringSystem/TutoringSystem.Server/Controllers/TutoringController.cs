using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentskaSluzba.Data;
using StudentskaSluzba.Models;
using BCrypt.Net;

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

        // ========== REGISTRACIJA ==========
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Preveri èe email že obstaja
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Email že obstaja v sistemu" });
            }

            // Hashiraj geslo
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Ustvari novega uporabnika
            var newUser = new User
            {
                Ime = request.Ime,
                Priimek = request.Priimek,
                Email = request.Email,
                GesloHash = hashedPassword,
                RolaId = request.RolaId
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Uporabnik uspešno registriran!",
                id = newUser.Id,
                name = $"{newUser.Ime} {newUser.Priimek}",
                email = newUser.Email,
                roleId = newUser.RolaId
            });
        }

        // ========== PRIJAVA (LOGIN) ==========
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Debug log
            Console.WriteLine($"Login attempt: {request.Email} / {request.Password}");

            // Poišèi uporabnika po emailu
            var user = await _context.Users
                .Include(u => u.Rola)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                Console.WriteLine($"User not found: {request.Email}");
                return Unauthorized(new { message = "Email ali geslo je napaèen" });
            }

            Console.WriteLine($"User found: {user.Ime} {user.Priimek}, Role: {user.RolaId}");
            Console.WriteLine($"Stored hash: {user.GesloHash}");
            Console.WriteLine($"Input password: {request.Password}");

            // Preveri geslo - podpira tako BCrypt hash kot tudi direktno primerjavo (za stare podatke)
            bool passwordValid = false;

            // Poskusi BCrypt verifikacijo
            try
            {
                if (BCrypt.Net.BCrypt.Verify(request.Password, user.GesloHash))
                {
                    passwordValid = true;
                    Console.WriteLine("Password verified with BCrypt");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"BCrypt verify error: {ex.Message}");
            }

            // Èe BCrypt ne deluje, poskusi direktno primerjavo (za stare ne-hashirane podatke)
            if (!passwordValid && user.GesloHash == request.Password)
            {
                passwordValid = true;
                Console.WriteLine("Password verified with direct comparison");
            }

            // ZA TESTIRANJE - èe uporabnik vnese "password123" in je email testni
            if (!passwordValid && request.Password == "password123" && (request.Email.Contains("test") || request.Email.Contains("student")))
            {
                passwordValid = true;
                Console.WriteLine("Password verified with test password");
            }

            if (!passwordValid)
            {
                Console.WriteLine("Password invalid!");
                return Unauthorized(new { message = "Email ali geslo je napaèen" });
            }

            Console.WriteLine("Login successful!");

            return Ok(new
            {
                id = user.Id,
                name = $"{user.Ime} {user.Priimek}",
                email = user.Email,
                roleId = user.RolaId,
                role = GetRoleName(user.RolaId),
                token = "token-" + Guid.NewGuid().ToString()
            });
        }

        // ========== GOVORILNE URE ==========
        [HttpGet("officehours")]
        public async Task<IActionResult> GetOfficeHours()
        {
            var officeHours = await _context.OfficeHours
                .Include(o => o.Uporabnik)
                .Include(o => o.Predmet)
                .Include(o => o.Rezervacije)
                .OrderBy(o => o.Zacetek)
                .ToListAsync();
            return Ok(officeHours);
        }

        [HttpGet("officehours/{id}")]
        public async Task<IActionResult> GetOfficeHour(int id)
        {
            var officeHour = await _context.OfficeHours
                .Include(o => o.Uporabnik)
                .Include(o => o.Predmet)
                .Include(o => o.Rezervacije)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (officeHour == null)
                return NotFound(new { message = "Govorilna ura ne obstaja" });

            return Ok(officeHour);
        }

        [HttpPost("officehours")]
        public async Task<IActionResult> CreateOfficeHour([FromBody] OfficeHour officeHour)
        {
            if (officeHour.Zacetek < DateTime.Now)
                return BadRequest(new { message = "Zaèetek ne more biti v preteklosti" });

            _context.OfficeHours.Add(officeHour);
            await _context.SaveChangesAsync();

            // Naloži povezane podatke za vrnitev
            var created = await _context.OfficeHours
                .Include(o => o.Uporabnik)
                .Include(o => o.Predmet)
                .FirstOrDefaultAsync(o => o.Id == officeHour.Id);

            return Ok(created);
        }

        [HttpPut("officehours/{id}")]
        public async Task<IActionResult> UpdateOfficeHour(int id, [FromBody] OfficeHour officeHour)
        {
            var existing = await _context.OfficeHours.FindAsync(id);
            if (existing == null)
                return NotFound(new { message = "Govorilna ura ne obstaja" });

            existing.Zacetek = officeHour.Zacetek;
            existing.Konec = officeHour.Konec;
            existing.Uèilnica = officeHour.Uèilnica;
            existing.PredmetId = officeHour.PredmetId;

            await _context.SaveChangesAsync();

            var updated = await _context.OfficeHours
                .Include(o => o.Uporabnik)
                .Include(o => o.Predmet)
                .FirstOrDefaultAsync(o => o.Id == id);

            return Ok(updated);
        }

        [HttpDelete("officehours/{id}")]
        public async Task<IActionResult> DeleteOfficeHour(int id)
        {
            var officeHour = await _context.OfficeHours
                .Include(o => o.Rezervacije)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (officeHour == null)
                return NotFound(new { message = "Govorilna ura ne obstaja" });

            // Preveri èe obstajajo potrjene rezervacije
            var hasConfirmedReservations = officeHour.Rezervacije?.Any(r => r.Status == 1) ?? false;
            if (hasConfirmedReservations)
                return BadRequest(new { message = "Ne moreš izbrisati govorilne ure, ker ima potrjene rezervacije" });

            _context.OfficeHours.Remove(officeHour);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Govorilna ura izbrisana" });
        }

        // ========== REZERVACIJE ==========
        [HttpPost("reservations")]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequest request)
        {
            // Preveri èe govorilna ura obstaja
            var officeHour = await _context.OfficeHours
                .Include(o => o.Rezervacije)
                .FirstOrDefaultAsync(o => o.Id == request.OfficeHourId);

            if (officeHour == null)
                return NotFound(new { message = "Govorilna ura ne obstaja" });

            // Preveri èe je termin v prihodnosti
            if (officeHour.Zacetek < DateTime.Now)
                return BadRequest(new { message = "Ne moreš rezervirati preteklega termina" });

            // Preveri èe je študent že rezerviral
            var alreadyReserved = officeHour.Rezervacije?
                .Any(r => r.UserId == request.UserId && r.Status != 2) ?? false;

            if (alreadyReserved)
                return BadRequest(new { message = "Že imaš rezervacijo za ta termin" });

            // Preveri prosto mesto (max 10)
            var confirmedCount = officeHour.Rezervacije?.Count(r => r.Status == 1) ?? 0;
            if (confirmedCount >= 10)
                return BadRequest(new { message = "Ni veè prostih mest" });

            var reservation = new Reservation
            {
                UserId = request.UserId,
                OfficeHourId = request.OfficeHourId,
                Status = 0 // 0 = èaka na potrditev
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Rezervacija ustvarjena", id = reservation.Id });
        }

        [HttpPut("reservations/{id}/status")]
        public async Task<IActionResult> UpdateReservationStatus(int id, [FromBody] int status)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
                return NotFound(new { message = "Rezervacija ne obstaja" });

            reservation.Status = status;
            await _context.SaveChangesAsync();

            string statusMessage = status switch
            {
                0 => "Rezervacija èaka na potrditev",
                1 => "Rezervacija potrjena",
                2 => "Rezervacija preklicana",
                3 => "Rezervacija opravljena",
                _ => "Status posodobljen"
            };

            return Ok(new { message = statusMessage });
        }

        [HttpDelete("reservations/{id}")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
                return NotFound(new { message = "Rezervacija ne obstaja" });

            _context.Reservations.Remove(reservation);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Rezervacija izbrisana" });
        }

        // ========== TUTORJI ==========
        [HttpGet("tutors")]
        public async Task<IActionResult> GetTutors()
        {
            var tutors = await _context.Users
                .Where(u => u.RolaId == 2 || u.RolaId == 4) // Tutorji in profesorji
                .Select(u => new
                {
                    u.Id,
                    u.Ime,
                    u.Priimek,
                    name = $"{u.Ime} {u.Priimek}",
                    u.Email,
                    roleId = u.RolaId,
                    role = u.RolaId == 2 ? "tutor" : "professor",
                    subject = "Razlièni predmeti",
                    description = u.RolaId == 2 ? "Pomoè pri uèenju" : "Predavanja in konzultacije",
                    price = 15,
                    rating = 4.5,
                    reviews = 10
                })
                .ToListAsync();
            return Ok(tutors);
        }

        [HttpGet("tutors/{id}")]
        public async Task<IActionResult> GetTutor(int id)
        {
            var user = await _context.Users
                .Include(u => u.TutorPredmeti)
                    .ThenInclude(t => t.Predmet)
                .FirstOrDefaultAsync(u => u.Id == id && (u.RolaId == 2 || u.RolaId == 4));

            if (user == null)
                return NotFound(new { message = "Tutor ne obstaja" });

            return Ok(new
            {
                user.Id,
                user.Ime,
                user.Priimek,
                user.Email,
                roleId = user.RolaId,
                subjects = user.TutorPredmeti?.Select(t => t.Predmet?.Naziv).ToList() ?? new List<string>()
            });
        }

        // ========== PREDMETI ==========
        [HttpGet("subjects")]
        public async Task<IActionResult> GetSubjects()
        {
            var subjects = await _context.Subjects.ToListAsync();
            return Ok(subjects);
        }

        [HttpGet("subjects/{id}")]
        public async Task<IActionResult> GetSubject(int id)
        {
            var subject = await _context.Subjects
                .Include(s => s.Tutorji)
                    .ThenInclude(t => t.Uporabnik)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (subject == null)
                return NotFound(new { message = "Predmet ne obstaja" });

            return Ok(subject);
        }

        // ========== UPORABNIKI ==========
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.Rola)
                .Select(u => new
                {
                    u.Id,
                    u.Ime,
                    u.Priimek,
                    u.Email,
                    roleId = u.RolaId,
                    role = GetRoleName(u.RolaId)
                })
                .ToListAsync();
            return Ok(users);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Rola)
                .Include(u => u.Rezervacije)
                    .ThenInclude(r => r.GovorilnaUra)
                        .ThenInclude(g => g.Predmet)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound(new { message = "Uporabnik ne obstaja" });

            return Ok(user);
        }

        // ========== STATISTIKA ==========
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = new
            {
                totalUsers = await _context.Users.CountAsync(),
                totalStudents = await _context.Users.CountAsync(u => u.RolaId == 3),
                totalTutors = await _context.Users.CountAsync(u => u.RolaId == 2),
                totalProfessors = await _context.Users.CountAsync(u => u.RolaId == 4),
                totalSubjects = await _context.Subjects.CountAsync(),
                totalOfficeHours = await _context.OfficeHours.CountAsync(),
                totalReservations = await _context.Reservations.CountAsync(),
                pendingReservations = await _context.Reservations.CountAsync(r => r.Status == 0),
                confirmedReservations = await _context.Reservations.CountAsync(r => r.Status == 1)
            };

            return Ok(stats);
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

    // Model za registracijo
    public class RegisterRequest
    {
        public string Ime { get; set; } = string.Empty;
        public string Priimek { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int RolaId { get; set; } = 3; // Privzeto student
    }

    // Model za kreiranje rezervacije
    public class CreateReservationRequest
    {
        public int UserId { get; set; }
        public int OfficeHourId { get; set; }
    }
}