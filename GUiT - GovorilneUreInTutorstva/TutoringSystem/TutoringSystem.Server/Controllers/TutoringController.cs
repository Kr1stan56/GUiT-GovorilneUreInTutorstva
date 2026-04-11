using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentskaSluzba.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

        // ========== USERS (Uporabniki) ==========

        // GET: api/tutoring/users
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.Rola)
                .Include(u => u.TutorPredmeti)
                    .ThenInclude(t => t.Predmet)
                .ToListAsync();
            return Ok(users);
        }

        // GET: api/tutoring/users/{id}
        [HttpGet("users/{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Rola)
                .Include(u => u.TutorPredmeti)
                    .ThenInclude(t => t.Predmet)
                .Include(u => u.GovorilneUre)
                .Include(u => u.Rezervacije)
                    .ThenInclude(r => r.GovorilnaUra)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound($"Uporabnik z ID {id} ne obstaja");

            return Ok(user);
        }

        // GET: api/tutoring/users/role/{roleId}
        [HttpGet("users/role/{roleId}")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsersByRole(int roleId)
        {
            var users = await _context.Users
                .Include(u => u.Rola)
                .Where(u => u.RolaId == roleId)
                .ToListAsync();
            return Ok(users);
        }

        // GET: api/tutoring/students
        [HttpGet("students")]
        public async Task<ActionResult<IEnumerable<User>>> GetStudents()
        {
            var students = await _context.Users
                .Include(u => u.Rola)
                .Where(u => u.RolaId == 3)
                .ToListAsync();
            return Ok(students);
        }

        // GET: api/tutoring/tutors
        [HttpGet("tutors")]
        public async Task<ActionResult<IEnumerable<User>>> GetTutors()
        {
            var tutors = await _context.Users
                .Include(u => u.Rola)
                .Where(u => u.RolaId == 2 || u.RolaId == 4) // Tutorji in profesorji
                .ToListAsync();
            return Ok(tutors);
        }

        // POST: api/tutoring/users
        [HttpPost("users")]
        public async Task<ActionResult<User>> CreateUser([FromBody] User user)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                return BadRequest("Email že obstaja");

            // TODO: Hashiraj geslo!
            user.GesloHash = HashPassword(user.GesloHash);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }

        // ========== SUBJECTS (Predmeti) ==========

        // GET: api/tutoring/subjects
        [HttpGet("subjects")]
        public async Task<ActionResult<IEnumerable<Subject>>> GetSubjects()
        {
            var subjects = await _context.Subjects
                .Include(s => s.Tutorji)
                    .ThenInclude(t => t.Uporabnik)
                .Include(s => s.GovorilneUre)
                .ToListAsync();
            return Ok(subjects);
        }

        // POST: api/tutoring/subjects
        [HttpPost("subjects")]
        public async Task<ActionResult<Subject>> CreateSubject([FromBody] Subject subject)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSubject), new { id = subject.Id }, subject);
        }

        // GET: api/tutoring/subjects/{id}
        [HttpGet("subjects/{id}")]
        public async Task<ActionResult<Subject>> GetSubject(int id)
        {
            var subject = await _context.Subjects
                .Include(s => s.Tutorji)
                    .ThenInclude(t => t.Uporabnik)
                .Include(s => s.GovorilneUre)
                    .ThenInclude(g => g.Uporabnik)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (subject == null)
                return NotFound();

            return Ok(subject);
        }

        // ========== TUTOR-SUBJECT ASSIGNMENTS ==========

        // GET: api/tutoring/assignments
        [HttpGet("assignments")]
        public async Task<ActionResult<IEnumerable<Tutor>>> GetTutorSubjectAssignments()
        {
            var assignments = await _context.TutorSubjects
                .Include(t => t.Uporabnik)
                .Include(t => t.Predmet)
                .ToListAsync();
            return Ok(assignments);
        }

        // POST: api/tutoring/assignments
        [HttpPost("assignments")]
        public async Task<ActionResult<Tutor>> AssignTutorToSubject([FromBody] Tutor assignment)
        {
            var exists = await _context.TutorSubjects
                .AnyAsync(t => t.UserId == assignment.UserId && t.PredmetId == assignment.PredmetId);

            if (exists)
                return BadRequest("Tutor je že dodeljen temu predmetu");

            _context.TutorSubjects.Add(assignment);
            await _context.SaveChangesAsync();
            return Ok(assignment);
        }

        // DELETE: api/tutoring/assignments/{userId}/{subjectId}
        [HttpDelete("assignments/{userId}/{subjectId}")]
        public async Task<IActionResult> RemoveTutorFromSubject(int userId, int subjectId)
        {
            var assignment = await _context.TutorSubjects
                .FirstOrDefaultAsync(t => t.UserId == userId && t.PredmetId == subjectId);

            if (assignment == null)
                return NotFound();

            _context.TutorSubjects.Remove(assignment);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ========== OFFICE HOURS (Govorilne ure) ==========

        // GET: api/tutoring/office-hours
        [HttpGet("office-hours")]
        public async Task<ActionResult<IEnumerable<OfficeHour>>> GetOfficeHours()
        {
            var officeHours = await _context.OfficeHours
                .Include(o => o.Uporabnik)
                .Include(o => o.Predmet)
                .Include(o => o.Rezervacije)
                .OrderBy(o => o.Zacetek)
                .ToListAsync();
            return Ok(officeHours);
        }

        // GET: api/tutoring/office-hours/{id}
        [HttpGet("office-hours/{id}")]
        public async Task<ActionResult<OfficeHour>> GetOfficeHour(int id)
        {
            var officeHour = await _context.OfficeHours
                .Include(o => o.Uporabnik)
                .Include(o => o.Predmet)
                .Include(o => o.Rezervacije)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (officeHour == null)
                return NotFound();

            return Ok(officeHour);
        }

        // GET: api/tutoring/office-hours/tutor/{tutorId}
        [HttpGet("office-hours/tutor/{tutorId}")]
        public async Task<ActionResult<IEnumerable<OfficeHour>>> GetOfficeHoursByTutor(int tutorId)
        {
            var officeHours = await _context.OfficeHours
                .Include(o => o.Uporabnik)
                .Include(o => o.Predmet)
                .Where(o => o.UserId == tutorId)
                .OrderBy(o => o.Zacetek)
                .ToListAsync();
            return Ok(officeHours);
        }

        // POST: api/tutoring/office-hours
        [HttpPost("office-hours")]
        public async Task<ActionResult<OfficeHour>> CreateOfficeHour([FromBody] OfficeHour officeHour)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FindAsync(officeHour.UserId);
            if (user == null)
                return BadRequest("Uporabnik ne obstaja");

            if (user.RolaId != 2 && user.RolaId != 4)
                return BadRequest("Samo tutorji in profesorji lahko ustvarjajo govorilne ure");

            if (officeHour.Zacetek < DateTime.Now)
                return BadRequest("Zaèetek ne more biti v preteklosti");

            _context.OfficeHours.Add(officeHour);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOfficeHour), new { id = officeHour.Id }, officeHour);
        }

        // DELETE: api/tutoring/office-hours/{id}
        [HttpDelete("office-hours/{id}")]
        public async Task<IActionResult> DeleteOfficeHour(int id)
        {
            var officeHour = await _context.OfficeHours
                .Include(o => o.Rezervacije)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (officeHour == null)
                return NotFound();

            if (officeHour.Rezervacije.Any(r => r.Status == 1))
                return BadRequest("Ne moreš izbrisati, ker obstajajo potrjene rezervacije");

            _context.OfficeHours.Remove(officeHour);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ========== RESERVATIONS ==========

        // GET: api/tutoring/reservations
        [HttpGet("reservations")]
        public async Task<ActionResult<IEnumerable<Reservation>>> GetReservations()
        {
            var reservations = await _context.Reservations
                .Include(r => r.Uporabnik)
                .Include(r => r.GovorilnaUra)
                    .ThenInclude(g => g.Uporabnik)
                .Include(r => r.GovorilnaUra)
                    .ThenInclude(g => g.Predmet)
                .ToListAsync();
            return Ok(reservations);
        }

        // GET: api/tutoring/reservations/user/{userId}
        [HttpGet("reservations/user/{userId}")]
        public async Task<ActionResult<IEnumerable<Reservation>>> GetReservationsByUser(int userId)
        {
            var reservations = await _context.Reservations
                .Include(r => r.Uporabnik)
                .Include(r => r.GovorilnaUra)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.GovorilnaUra.Zacetek)
                .ToListAsync();
            return Ok(reservations);
        }

        // POST: api/tutoring/reservations
        [HttpPost("reservations")]
        public async Task<ActionResult<Reservation>> CreateReservation([FromBody] Reservation reservation)
        {
            var officeHour = await _context.OfficeHours
                .Include(o => o.Rezervacije)
                .FirstOrDefaultAsync(o => o.Id == reservation.OfficeHourId);

            if (officeHour == null)
                return BadRequest("Govorilna ura ne obstaja");

            if (officeHour.Zacetek < DateTime.Now)
                return BadRequest("Ne moreš rezervirati preteklega termina");

            var alreadyReserved = await _context.Reservations
                .AnyAsync(r => r.UserId == reservation.UserId &&
                              r.OfficeHourId == reservation.OfficeHourId &&
                              r.Status != 2);

            if (alreadyReserved)
                return BadRequest("Že imaš rezervacijo za ta termin");

            var confirmedCount = officeHour.Rezervacije.Count(r => r.Status == 1);
            if (confirmedCount >= 10)
                return BadRequest("Ni veè prostih mest");

            reservation.Status = 0; // èaka na potrditev
            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReservation), new { id = reservation.Id }, reservation);
        }

        // GET: api/tutoring/reservations/{id}
        [HttpGet("reservations/{id}")]
        public async Task<ActionResult<Reservation>> GetReservation(int id)
        {
            var reservation = await _context.Reservations
                .Include(r => r.Uporabnik)
                .Include(r => r.GovorilnaUra)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservation == null)
                return NotFound();

            return Ok(reservation);
        }

        // PUT: api/tutoring/reservations/{id}/status
        [HttpPut("reservations/{id}/status")]
        public async Task<IActionResult> UpdateReservationStatus(int id, [FromBody] int status)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
                return NotFound();

            if (status < 0 || status > 3)
                return BadRequest("Neveljaven status");

            reservation.Status = status;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/tutoring/reservations/{id}
        [HttpDelete("reservations/{id}")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
                return NotFound();

            _context.Reservations.Remove(reservation);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ========== DASHBOARD ==========

        // GET: api/tutoring/dashboard
        [HttpGet("dashboard")]
        public async Task<ActionResult<object>> GetDashboardStats()
        {
            return Ok(new
            {
                TotalStudents = await _context.Users.CountAsync(u => u.RolaId == 3),
                TotalTutors = await _context.Users.CountAsync(u => u.RolaId == 2),
                TotalProfessors = await _context.Users.CountAsync(u => u.RolaId == 4),
                TotalSubjects = await _context.Subjects.CountAsync(),
                TotalOfficeHours = await _context.OfficeHours.CountAsync(),
                PendingReservations = await _context.Reservations.CountAsync(r => r.Status == 0),
                ConfirmedReservations = await _context.Reservations.CountAsync(r => r.Status == 1),
                CompletedReservations = await _context.Reservations.CountAsync(r => r.Status == 3)
            });
        }

        private string HashPassword(string password)
        {
            // TODO: Implementiraj BCrypt ali podobno
            return password;
        }
    }
}