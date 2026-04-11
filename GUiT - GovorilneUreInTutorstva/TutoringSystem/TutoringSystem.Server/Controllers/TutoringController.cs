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
            try
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
                    roleId = newUser.RolaId,
                    role = GetRoleName(newUser.RolaId)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka pri registraciji: {ex.Message}" });
            }
        }

        // ========== PRIJAVA (LOGIN) ==========
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                Console.WriteLine($"Login attempt: {request.Email}");

                // Poišèi uporabnika po emailu
                var user = await _context.Users
                    .Include(u => u.Rola)
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    return Unauthorized(new { message = "Email ali geslo je napaèen" });
                }

                // Preveri geslo
                bool passwordValid = false;

                // Poskusi BCrypt verifikacijo
                try
                {
                    if (BCrypt.Net.BCrypt.Verify(request.Password, user.GesloHash))
                    {
                        passwordValid = true;
                    }
                }
                catch { }

                // Èe BCrypt ne deluje, poskusi direktno primerjavo
                if (!passwordValid && user.GesloHash == request.Password)
                {
                    passwordValid = true;
                }

                // ZA TESTIRANJE - èe uporabnik vnese "password123"
                if (!passwordValid && request.Password == "password123")
                {
                    passwordValid = true;
                }

                if (!passwordValid)
                {
                    return Unauthorized(new { message = "Email ali geslo je napaèen" });
                }

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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka pri prijavi: {ex.Message}" });
            }
        }

        // ========== TEST BAZE ==========
        [HttpGet("test-db")]
        public async Task<IActionResult> TestDatabase()
        {
            try
            {
                var userCount = await _context.Users.CountAsync();
                var roleCount = await _context.Roles.CountAsync();
                var subjectCount = await _context.Subjects.CountAsync();

                return Ok(new
                {
                    message = "Baza dela!",
                    users = userCount,
                    roles = roleCount,
                    subjects = subjectCount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stack = ex.StackTrace });
            }
        }

        // ========== GOVORILNE URE ==========
        [HttpGet("officehours")]
        public async Task<IActionResult> GetOfficeHours()
        {
            try
            {
                var officeHours = await _context.OfficeHours
                    .Include(o => o.Uporabnik)
                    .Include(o => o.Predmet)
                    .Include(o => o.Rezervacije)
                    .OrderBy(o => o.Zacetek)
                    .ToListAsync();
                return Ok(officeHours);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka pri nalaganju: {ex.Message}" });
            }
        }

        [HttpGet("officehours/{id}")]
        public async Task<IActionResult> GetOfficeHour(int id)
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        [HttpPost("officehours")]
        public async Task<IActionResult> CreateOfficeHour([FromBody] OfficeHour officeHour)
        {
            try
            {
                if (officeHour.Zacetek < DateTime.Now)
                    return BadRequest(new { message = "Zaèetek ne more biti v preteklosti" });

                _context.OfficeHours.Add(officeHour);
                await _context.SaveChangesAsync();

                var created = await _context.OfficeHours
                    .Include(o => o.Uporabnik)
                    .Include(o => o.Predmet)
                    .FirstOrDefaultAsync(o => o.Id == officeHour.Id);

                return Ok(created);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka pri ustvarjanju: {ex.Message}" });
            }
        }

        [HttpPut("officehours/{id}")]
        public async Task<IActionResult> UpdateOfficeHour(int id, [FromBody] OfficeHour officeHour)
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka pri posodabljanju: {ex.Message}" });
            }
        }

        [HttpDelete("officehours/{id}")]
        public async Task<IActionResult> DeleteOfficeHour(int id)
        {
            try
            {
                var officeHour = await _context.OfficeHours
                    .Include(o => o.Rezervacije)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (officeHour == null)
                    return NotFound(new { message = "Govorilna ura ne obstaja" });

                var hasConfirmedReservations = officeHour.Rezervacije?.Any(r => r.Status == 1) ?? false;
                if (hasConfirmedReservations)
                    return BadRequest(new { message = "Ne moreš izbrisati govorilne ure, ker ima potrjene rezervacije" });

                _context.OfficeHours.Remove(officeHour);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Govorilna ura izbrisana" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka pri brisanju: {ex.Message}" });
            }
        }

        // ========== REZERVACIJE ==========
        [HttpPost("reservations")]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequest request)
        {
            try
            {
                var officeHour = await _context.OfficeHours
                    .Include(o => o.Rezervacije)
                    .FirstOrDefaultAsync(o => o.Id == request.OfficeHourId);

                if (officeHour == null)
                    return NotFound(new { message = "Govorilna ura ne obstaja" });

                if (officeHour.Zacetek < DateTime.Now)
                    return BadRequest(new { message = "Ne moreš rezervirati preteklega termina" });

                var alreadyReserved = officeHour.Rezervacije?
                    .Any(r => r.UserId == request.UserId && r.Status != 2) ?? false;

                if (alreadyReserved)
                    return BadRequest(new { message = "Že imaš rezervacijo za ta termin" });

                var confirmedCount = officeHour.Rezervacije?.Count(r => r.Status == 1) ?? 0;
                if (confirmedCount >= 10)
                    return BadRequest(new { message = "Ni veè prostih mest" });

                var reservation = new Reservation
                {
                    UserId = request.UserId,
                    OfficeHourId = request.OfficeHourId,
                    Status = 0
                };

                _context.Reservations.Add(reservation);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Rezervacija ustvarjena", id = reservation.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka pri rezervaciji: {ex.Message}" });
            }
        }

        [HttpPut("reservations/{id}/status")]
        public async Task<IActionResult> UpdateReservationStatus(int id, [FromBody] int status)
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        [HttpDelete("reservations/{id}")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            try
            {
                var reservation = await _context.Reservations.FindAsync(id);
                if (reservation == null)
                    return NotFound(new { message = "Rezervacija ne obstaja" });

                _context.Reservations.Remove(reservation);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Rezervacija izbrisana" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        // ========== TUTORJI ==========
        [HttpGet("tutors")]
        public async Task<IActionResult> GetTutors()
        {
            try
            {
                var tutors = await _context.Users
                    .Where(u => u.RolaId == 2 || u.RolaId == 4)
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        [HttpGet("tutors/{id}")]
        public async Task<IActionResult> GetTutor(int id)
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        // ========== PREDMETI ==========
        [HttpGet("subjects")]
        public async Task<IActionResult> GetSubjects()
        {
            try
            {
                var subjects = await _context.Subjects.ToListAsync();
                return Ok(subjects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        [HttpGet("subjects/{id}")]
        public async Task<IActionResult> GetSubject(int id)
        {
            try
            {
                var subject = await _context.Subjects
                    .Include(s => s.Tutorji)
                        .ThenInclude(t => t.Uporabnik)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (subject == null)
                    return NotFound(new { message = "Predmet ne obstaja" });

                return Ok(subject);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        // ========== UPORABNIKI ==========
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        // ========== STATISTIKA ==========
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        // ========== STORED PROCEDURE PRIMER ==========
        [HttpGet("stats-sp")]
        public async Task<IActionResult> GetStatsFromSP()
        {
            try
            {
                var stats = new List<dynamic>();

                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = "SELECT * FROM sp_get_dashboard_stats()";
                    command.CommandType = System.Data.CommandType.Text;

                    await _context.Database.OpenConnectionAsync();

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            stats.Add(new { name = reader[0].ToString(), value = Convert.ToInt64(reader[1]) });
                        }
                    }
                }

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka pri klicu SP: {ex.Message}" });
            }
        }

        // ========== MOJE PRIJAVE ==========
        [HttpGet("my-enrollments/{userId}")]
        public async Task<IActionResult> GetMyEnrollments(int userId)
        {
            try
            {
                var reservations = await _context.Reservations
                    .Include(r => r.GovorilnaUra)
                        .ThenInclude(g => g.Uporabnik)
                    .Include(r => r.GovorilnaUra)
                        .ThenInclude(g => g.Predmet)
                    .Where(r => r.UserId == userId && r.Status != 2)
                    .ToListAsync();

                var officeHours = reservations.Select(r => r.GovorilnaUra).ToList();
                return Ok(officeHours);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        // ========== PRIJAVA NA GOVORILNO URO ==========
        [HttpPost("officehours/{id}/enroll")]
        public async Task<IActionResult> EnrollStudent(int id, [FromBody] int studentId)
        {
            try
            {
                var officeHour = await _context.OfficeHours
                    .Include(o => o.Rezervacije)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (officeHour == null)
                    return NotFound(new { message = "Govorilna ura ne obstaja" });

                if (officeHour.Rezervacije != null && officeHour.Rezervacije.Any(r => r.UserId == studentId && r.Status != 2))
                    return BadRequest(new { message = "Že ste prijavljeni na to govorilno uro" });

                var confirmedCount = officeHour.Rezervacije?.Count(r => r.Status == 1) ?? 0;
                if (confirmedCount >= 10)
                    return BadRequest(new { message = "Ni veè prostih mest" });

                var reservation = new Reservation
                {
                    UserId = studentId,
                    OfficeHourId = id,
                    Status = 1
                };

                _context.Reservations.Add(reservation);
                await _context.SaveChangesAsync();

                var updated = await _context.OfficeHours
                    .Include(o => o.Uporabnik)
                    .Include(o => o.Predmet)
                    .Include(o => o.Rezervacije)
                    .FirstOrDefaultAsync(o => o.Id == id);

                return Ok(updated);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka pri prijavi: {ex.Message}" });
            }
        }

        // ========== PRETEKLI TERMINI ==========
        [HttpGet("officehours/upcoming")]
        public async Task<IActionResult> GetUpcomingOfficeHours()
        {
            try
            {
                var officeHours = await _context.OfficeHours
                    .Include(o => o.Uporabnik)
                    .Include(o => o.Predmet)
                    .Include(o => o.Rezervacije)
                    .Where(o => o.Zacetek > DateTime.Now)
                    .OrderBy(o => o.Zacetek)
                    .ToListAsync();
                return Ok(officeHours);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        // ========== PREKLIC PRIJAVE ==========
        [HttpPost("officehours/{id}/cancel")]
        public async Task<IActionResult> CancelEnrollment(int id, [FromBody] int studentId)
        {
            try
            {
                var reservation = await _context.Reservations
                    .FirstOrDefaultAsync(r => r.OfficeHourId == id && r.UserId == studentId && r.Status == 1);

                if (reservation == null)
                    return NotFound(new { message = "Prijava ne obstaja" });

                reservation.Status = 2;
                await _context.SaveChangesAsync();

                var updated = await _context.OfficeHours
                    .Include(o => o.Uporabnik)
                    .Include(o => o.Predmet)
                    .Include(o => o.Rezervacije)
                    .FirstOrDefaultAsync(o => o.Id == id);

                return Ok(updated);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka pri preklicu: {ex.Message}" });
            }
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
        public int RolaId { get; set; } = 3;
    }

    // Model za kreiranje rezervacije
    public class CreateReservationRequest
    {
        public int UserId { get; set; }
        public int OfficeHourId { get; set; }
    }
}