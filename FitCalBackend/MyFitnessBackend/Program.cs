// MyFitnessBackend/Program.cs
using MyFitnessBackend.Models;
using Microsoft.Extensions.Configuration; // To access API keys

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient(); // Registers HttpClientFactory


// --- CORS Configuration ---
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            // IMPORTANT: In production, replace `*` with your actual frontend URL(s)
            // For local Expo development, common URLs include:
            // "http://localhost:19006" (Expo Go web client)
            // "exp://192.168.X.X:19000" (Expo Go app on device/emulator, replace X.X with your local IP)
            // You might need to add specific URLs as you test on different devices/emulators.
            // Example:
            // policy.WithOrigins("http://localhost:19006", "exp://192.168.1.100:19000")
            //        .AllowAnyHeader()
            //        .AllowAnyMethod();

            policy.AllowAnyOrigin() // For development, this is simplest but less secure for prod
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting(); // Important: Must be before UseCors and UseAuthorization
app.UseCors(); // Apply the CORS policy
app.UseAuthorization();
app.MapControllers();

app.Run();