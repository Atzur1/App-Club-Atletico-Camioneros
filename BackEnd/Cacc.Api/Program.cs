using CACC.DAO;
using CACC.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using QuestPDF.Infrastructure;
using CACC.API.Authorization;

// Configuramos la licencia Community de QuestPDF
QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// Configurar CORS (Para que Angular no sea bloqueado)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:4200",
                  "http://127.0.0.1:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

//Inyección de Dependencias
builder.Services.AddScoped<IUsuarioDao, UsuarioDao>();
builder.Services.AddScoped<ICategoriaDao, CategoriaDao>();
builder.Services.AddScoped<IStaffDao, StaffDao>();
builder.Services.AddScoped<IJugadorDao, JugadorDao>();
builder.Services.AddScoped<IFichaMedicaDao, FichaMedicaDao>();
builder.Services.AddScoped<IAsistenciaDao, AsistenciaDao>();
builder.Services.AddScoped<ICredentialDao, CredentialDao>();
builder.Services.AddScoped<IAttendanceRegistrationService, AttendanceRegistrationService>();
builder.Services.AddSingleton<ICredentialTokenService, CredentialTokenService>();
builder.Services.AddSingleton<ICredentialPdfService>(_ => new CredentialPdfService(Path.Combine(builder.Environment.ContentRootPath, "Assets", "Credentials")));
builder.Services.AddScoped<IQrService, QrService>();
builder.Services.AddScoped<IUserScopeService, UserScopeService>();

//  Agregar soporte para los Controllers
builder.Services.AddControllers();

//  Configurar el validador de JWT
var jwtKey = builder.Configuration["JwtSettings:Key"]
    ?? throw new InvalidOperationException("Falta la clave JWT en appsettings.");
var jwtIssuer = builder.Configuration["JwtSettings:Issuer"];
var jwtAudience = builder.Configuration["JwtSettings:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

//  Configurar el Pipeline HTTP
app.UseCors("AllowAngular");

app.UseAuthentication(); // Primero validamos quién sos
app.UseAuthorization();  // Después validamos qué podés hacer

app.MapControllers();

app.Run();
