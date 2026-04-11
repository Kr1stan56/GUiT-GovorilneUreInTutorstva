using Microsoft.EntityFrameworkCore;
using StudentskaSluzba.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS - dovoli vse za test
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowAll");
app.MapControllers();

// Test baze ob zagonu
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        if (await db.Database.CanConnectAsync())
        {
            Console.WriteLine("✅ Baza povezana!");
            var count = await db.Users.CountAsync();
            Console.WriteLine($"📊 Uporabnikov: {count}");
        }
        else
        {
            Console.WriteLine("❌ Baza NI povezana!");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Napaka: {ex.Message}");
    }
}

app.Run();