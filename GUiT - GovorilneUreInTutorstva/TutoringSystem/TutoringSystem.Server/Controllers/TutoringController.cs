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

        // TEST ENDPOINT
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "Backend dela!", timestamp = DateTime.Now });
        }

        // TEST BAZE
        [HttpGet("test-db-connection")]
        public async Task<IActionResult> TestDbConnection()
        {
            try
            {
                var userCount = await _context.Users.CountAsync();
                return Ok(new { success = true, message = "Baza deluje!", userCount = userCount, timestamp = DateTime.Now });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // REGISTRACIJA
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (await _context.Users.AnyAsync(u => u.email == request.Email))
                    return BadRequest(new { message = "Email že obstaja v sistemu" });

                var user = new User
                {
                    ime = request.Ime,
                    priimek = request.Priimek,
                    email = request.Email,
                    geslo_hash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    rola_id = request.RolaId
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Uporabnik uspešno registriran!",
                    id = user.id,
                    name = $"{user.ime} {user.priimek}",
                    email = user.email,
                    roleId = user.rola_id,
                    role = GetRoleName(user.rola_id)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka pri registraciji: {ex.Message}" });
            }
        }

        // PRIJAVA (LOGIN)
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Rola)
                    .FirstOrDefaultAsync(u => u.email == request.Email);

                if (user == null)
                    return Unauthorized(new { message = "Email ali geslo je napaèen" });

                bool passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.geslo_hash);
                if (!passwordValid)
                    return Unauthorized(new { message = "Email ali geslo je napaèen" });

                return Ok(new
                {
                    id = user.id,
                    name = $"{user.ime} {user.priimek}",
                    email = user.email,
                    roleId = user.rola_id,
                    role = GetRoleName(user.rola_id),
                    token = "token-" + Guid.NewGuid().ToString()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka pri prijavi: {ex.Message}" });
            }
        }

        // GOVORILNE URE
        [HttpGet("officehours")]
        public async Task<IActionResult> GetOfficeHours()
        {
            try
            {
                var officeHours = await _context.OfficeHours
                    .Include(o => o.Uporabnik)
                    .Include(o => o.Predmet)
                    .Include(o => o.Rezervacije)
                    .OrderBy(o => o.zacetek)
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
                    .FirstOrDefaultAsync(o => o.id == id);
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
                if (officeHour.zacetek < DateTime.Now)
                    return BadRequest(new { message = "Zaèetek ne more biti v preteklosti" });

                _context.OfficeHours.Add(officeHour);
                await _context.SaveChangesAsync();

                var created = await _context.OfficeHours
                    .Include(o => o.Uporabnik)
                    .Include(o => o.Predmet)
                    .FirstOrDefaultAsync(o => o.id == officeHour.id);
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

                existing.zacetek = officeHour.zacetek;
                existing.konec = officeHour.konec;
                existing.uèilnica = officeHour.uèilnica;
                existing.predmet_id = officeHour.predmet_id;
                existing.komentar_ucitelja = officeHour.komentar_ucitelja;

                await _context.SaveChangesAsync();

                var updated = await _context.OfficeHours
                    .Include(o => o.Uporabnik)
                    .Include(o => o.Predmet)
                    .FirstOrDefaultAsync(o => o.id == id);
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
                    .FirstOrDefaultAsync(o => o.id == id);
                if (officeHour == null)
                    return NotFound(new { message = "Govorilna ura ne obstaja" });

                var hasConfirmedReservations = officeHour.Rezervacije?.Any(r => r.status == 1) ?? false;
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

        // REZERVACIJE
        [HttpPost("reservations")]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequest request)
        {
            try
            {
                var officeHour = await _context.OfficeHours
                    .Include(o => o.Rezervacije)
                    .FirstOrDefaultAsync(o => o.id == request.OfficeHourId);
                if (officeHour == null)
                    return NotFound(new { message = "Govorilna ura ne obstaja" });
                if (officeHour.zacetek < DateTime.Now)
                    return BadRequest(new { message = "Ne moreš rezervirati preteklega termina" });

                var alreadyReserved = officeHour.Rezervacije?.Any(r => r.Uporabnik_id == request.UserId && r.status != 2) ?? false;
                if (alreadyReserved)
                    return BadRequest(new { message = "Že imaš rezervacijo za ta termin" });

                var confirmedCount = officeHour.Rezervacije?.Count(r => r.status == 1) ?? 0;
                if (confirmedCount >= 10)
                    return BadRequest(new { message = "Ni veè prostih mest" });

                var reservation = new Reservation
                {
                    Uporabnik_id = request.UserId,
                    govorilna_ura_id = request.OfficeHourId,
                    status = 0
                };
                _context.Reservations.Add(reservation);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Rezervacija ustvarjena", id = reservation.id });
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
                reservation.status = status;
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

        // TUTORJI
        [HttpGet("tutors")]
        public async Task<IActionResult> GetTutors()
        {
            try
            {
                var tutors = await _context.Users
                    .Where(u => u.rola_id == 2 || u.rola_id == 4)
                    .Select(u => new
                    {
                        u.id,
                        u.ime,
                        u.priimek,
                        name = $"{u.ime} {u.priimek}",
                        u.email,
                        roleId = u.rola_id,
                        role = u.rola_id == 2 ? "tutor" : "professor",
                        subject = "Razlièni predmeti",
                        description = u.rola_id == 2 ? "Pomoè pri uèenju" : "Predavanja in konzultacije",
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
                    .FirstOrDefaultAsync(u => u.id == id && (u.rola_id == 2 || u.rola_id == 4));
                if (user == null)
                    return NotFound(new { message = "Tutor ne obstaja" });
                return Ok(new
                {
                    user.id,
                    user.ime,
                    user.priimek,
                    user.email,
                    roleId = user.rola_id,
                    subjects = user.TutorPredmeti?.Select(t => t.Predmet?.naziv).ToList() ?? new List<string>()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        // PREDMETI
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
                    .FirstOrDefaultAsync(s => s.id == id);
                if (subject == null)
                    return NotFound(new { message = "Predmet ne obstaja" });
                return Ok(subject);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        // UPORABNIKI
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _context.Users
                    .Include(u => u.Rola)
                    .Select(u => new
                    {
                        u.id,
                        u.ime,
                        u.priimek,
                        u.email,
                        roleId = u.rola_id,
                        role = GetRoleName(u.rola_id)
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
                    .FirstOrDefaultAsync(u => u.id == id);
                if (user == null)
                    return NotFound(new { message = "Uporabnik ne obstaja" });
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        // STATISTIKA
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var stats = new
                {
                    totalUsers = await _context.Users.CountAsync(),
                    totalStudents = await _context.Users.CountAsync(u => u.rola_id == 3),
                    totalTutors = await _context.Users.CountAsync(u => u.rola_id == 2),
                    totalProfessors = await _context.Users.CountAsync(u => u.rola_id == 4),
                    totalSubjects = await _context.Subjects.CountAsync(),
                    totalOfficeHours = await _context.OfficeHours.CountAsync(),
                    totalReservations = await _context.Reservations.CountAsync(),
                    pendingReservations = await _context.Reservations.CountAsync(r => r.status == 0),
                    confirmedReservations = await _context.Reservations.CountAsync(r => r.status == 1)
                };
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        // MOJE PRIJAVE
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
                    .Where(r => r.Uporabnik_id == userId && r.status != 2)
                    .ToListAsync();
                var officeHours = reservations.Select(r => r.GovorilnaUra).ToList();
                return Ok(officeHours);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        // PRIJAVA NA GOVORILNO URO (enroll)
        [HttpPost("officehours/{id}/enroll")]
        public async Task<IActionResult> EnrollStudent(int id, [FromBody] int studentId)
        {
            try
            {
                var officeHour = await _context.OfficeHours
                    .Include(o => o.Rezervacije)
                    .FirstOrDefaultAsync(o => o.id == id);
                if (officeHour == null)
                    return NotFound(new { message = "Govorilna ura ne obstaja" });
                if (officeHour.zacetek < DateTime.Now)
                    return BadRequest(new { message = "Ne moreš se prijaviti na pretekli termin" });
                if (officeHour.Rezervacije != null && officeHour.Rezervacije.Any(r => r.Uporabnik_id == studentId && r.status != 2))
                    return BadRequest(new { message = "Že ste prijavljeni na to govorilno uro" });
                var confirmedCount = officeHour.Rezervacije?.Count(r => r.status == 1) ?? 0;
                if (confirmedCount >= 10)
                    return BadRequest(new { message = "Ni veè prostih mest" });
                var reservation = new Reservation
                {
                    Uporabnik_id = studentId,
                    govorilna_ura_id = id,
                    status = 1  // takoj potrjeno (lahko spremenite na 0, èe želite èakanje)
                };
                _context.Reservations.Add(reservation);
                await _context.SaveChangesAsync();
                var updated = await _context.OfficeHours
                    .Include(o => o.Uporabnik)
                    .Include(o => o.Predmet)
                    .Include(o => o.Rezervacije)
                    .FirstOrDefaultAsync(o => o.id == id);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka pri prijavi: {ex.Message}" });
            }
        }

        // PRETEKLI TERMINI
        [HttpGet("officehours/upcoming")]
        public async Task<IActionResult> GetUpcomingOfficeHours()
        {
            try
            {
                var officeHours = await _context.OfficeHours
                    .Include(o => o.Uporabnik)
                    .Include(o => o.Predmet)
                    .Include(o => o.Rezervacije)
                    .Where(o => o.zacetek > DateTime.Now)
                    .OrderBy(o => o.zacetek)
                    .ToListAsync();
                return Ok(officeHours);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka: {ex.Message}" });
            }
        }

        // PREKLIC PRIJAVE
        [HttpPost("officehours/{id}/cancel")]
        public async Task<IActionResult> CancelEnrollment(int id, [FromBody] int studentId)
        {
            try
            {
                var reservation = await _context.Reservations
                    .FirstOrDefaultAsync(r => r.govorilna_ura_id == id && r.Uporabnik_id == studentId && r.status == 1);
                if (reservation == null)
                    return NotFound(new { message = "Prijava ne obstaja" });
                reservation.status = 2;
                await _context.SaveChangesAsync();
                var updated = await _context.OfficeHours
                    .Include(o => o.Uporabnik)
                    .Include(o => o.Predmet)
                    .Include(o => o.Rezervacije)
                    .FirstOrDefaultAsync(o => o.id == id);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Napaka pri preklicu: {ex.Message}" });
            }
        }

        // ========== NOVE AKCIJE ZA TUTORJA IN ADMINA ==========

        // Tutor: pridobi svoje predmete
        [HttpGet("tutor/{userId}/subjects")]
        public async Task<IActionResult> GetTutorSubjects(int userId)
        {
            var tutorSubjects = await _context.TutorSubjects
                .Include(ts => ts.Predmet)
                .Where(ts => ts.Uporabniki_id == userId)
                .Select(ts => ts.Predmet)
                .ToListAsync();
            return Ok(tutorSubjects);
        }

        // Tutor: dodeli predmet
        [HttpPost("tutor/{userId}/subjects")]
        public async Task<IActionResult> AddTutorSubject(int userId, [FromBody] int subjectId)
        {
            var existing = await _context.TutorSubjects
                .FirstOrDefaultAsync(ts => ts.Uporabniki_id == userId && ts.predmet_id == subjectId);
            if (existing != null)
                return BadRequest(new { message = "Že pouèujete ta predmet" });

            var tutorSubject = new Tutor { Uporabniki_id = userId, predmet_id = subjectId };
            _context.TutorSubjects.Add(tutorSubject);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Predmet dodan" });
        }

        // Tutor: odstrani predmet
        [HttpDelete("tutor/{userId}/subjects/{subjectId}")]
        public async Task<IActionResult> RemoveTutorSubject(int userId, int subjectId)
        {
            var tutorSubject = await _context.TutorSubjects
                .FirstOrDefaultAsync(ts => ts.Uporabniki_id == userId && ts.predmet_id == subjectId);
            if (tutorSubject == null)
                return NotFound();
            _context.TutorSubjects.Remove(tutorSubject);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Predmet odstranjen" });
        }

        // Tutor: posodobi urno postavko
        [HttpPut("tutor/{userId}/hourly-rate")]
        public async Task<IActionResult> UpdateHourlyRate(int userId, [FromBody] decimal rate)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();
            user.urna_postavka = rate;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Urna postavka posodobljena" });
        }

        // Tutor: pridobi prijave za svojo govorilno uro
        [HttpGet("officehours/{officeHourId}/reservations")]
        public async Task<IActionResult> GetReservationsForOfficeHour(int officeHourId)
        {
            var reservations = await _context.Reservations
                .Include(r => r.Uporabnik)
                .Where(r => r.govorilna_ura_id == officeHourId)
                .Select(r => new
                {
                    r.id,
                    r.status,
                    StudentName = r.Uporabnik != null ? $"{r.Uporabnik.ime} {r.Uporabnik.priimek}" : "",
                    StudentEmail = r.Uporabnik != null ? r.Uporabnik.email : "",
                    r.komentar_studenta,
                    r.komentar_ucitelja
                })
                .ToListAsync();
            return Ok(reservations);
        }

        // Tutor: posodobi komentar in status rezervacije
        [HttpPut("reservations/{reservationId}")]
        public async Task<IActionResult> UpdateReservation(int reservationId, [FromBody] UpdateReservationRequest request)
        {
            var reservation = await _context.Reservations.FindAsync(reservationId);
            if (reservation == null) return NotFound();
            if (request.Status.HasValue)
                reservation.status = request.Status.Value;
            if (request.KomentarUcitelja != null)
                reservation.komentar_ucitelja = request.KomentarUcitelja;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Rezervacija posodobljena" });
        }

        // Admin: vsi uporabniki z vlogami
        [HttpGet("admin/users")]
        public async Task<IActionResult> GetAllUsersForAdmin()
        {
            var users = await _context.Users
                .Include(u => u.Rola)
                .Select(u => new
                {
                    u.id,
                    u.ime,
                    u.priimek,
                    u.email,
                    RoleId = u.rola_id,
                    RoleName = u.Rola != null ? (u.Rola.naziv == 1 ? "admin" : u.Rola.naziv == 2 ? "tutor" : u.Rola.naziv == 3 ? "student" : "professor") : "unknown",
                    u.urna_postavka
                })
                .ToListAsync();
            return Ok(users);
        }

        // Admin: posodobi vlogo uporabnika
        [HttpPut("admin/users/{userId}/role")]
        public async Task<IActionResult> UpdateUserRole(int userId, [FromBody] int newRoleId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();
            user.rola_id = newRoleId;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Vloga posodobljena" });
        }

        // Admin: brisanje uporabnika
        [HttpDelete("admin/users/{userId}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Uporabnik izbrisan" });
        }

        // POMOŽNA METODA
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

    // RAZREDI ZA ZAHTEVKE
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Ime { get; set; } = string.Empty;
        public string Priimek { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int RolaId { get; set; } = 3;
    }

    public class CreateReservationRequest
    {
        public int UserId { get; set; }
        public int OfficeHourId { get; set; }
    }

    public class UpdateReservationRequest
    {
        public int? Status { get; set; }
        public string? KomentarUcitelja { get; set; }
    }
}