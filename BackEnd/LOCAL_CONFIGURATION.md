# Local configuration

The API reads its database and JWT configuration from standard ASP.NET Core configuration. Keep machine-specific values out of Git by using environment variables or .NET user secrets.

```powershell
cd BackEnd/CACC.API
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost\SQLEXPRESS;Database=ClubCamioneros;Trusted_Connection=True;TrustServerCertificate=True;"
dotnet user-secrets set "JwtSettings:Key" "<a private random key of at least 32 characters>"
```

Alternatively, copy `appsettings.example.json` to `appsettings.Local.json` and load it only in your local environment. Never commit that local file.

Database setup scripts live in `BackEnd/scripts/database`. Development-only seed data lives in `BackEnd/scripts/development`.
