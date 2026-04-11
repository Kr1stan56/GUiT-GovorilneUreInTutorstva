using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TutoringSystem.Server.Data;
using TutoringSystem.Server.Models;

namespace TutoringSystem.Server.Controllers
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

        // Test endpoint
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "API deluje!", timestamp = DateTime.Now });
        }

        // GET: api/tutoring/users
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.Rola)
                .ToListAsync();
            return Ok(users);
        }

        // GET: api/tutoring/subjects
        [HttpGet("subjects")]
        public async Task<ActionResult<IEnumerable<Subject>>> GetSubjects()
        {
            var subjects = await _context.Subjects.ToListAsync();
            return Ok(subjects);
        }
    }
}