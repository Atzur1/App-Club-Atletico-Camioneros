using CACC.API.Controllers;
using CACC.API.DTOs;
using CACC.API.Services;
using CACC.DAO;
using Microsoft.AspNetCore.Mvc;

namespace CACC.Tests;

public sealed class AsistenciasControllerTests
{
    [Fact]
    public async Task Legacy_manual_endpoint_rejects_the_same_invalid_dni_as_the_current_endpoint()
    {
        var attendance = new RecordingAttendanceService();
        var controller = new AsistenciasController(new StubTokenService(), new StubCredentialDao(), attendance);

        var current = await controller.RegisterManual(new ManualAttendanceRequest("abc", "test"));
        var legacy = await controller.Legacy(new AsistenciaRequestDto { Dni = "abc", Observaciones = "test" });

        Assert.IsType<BadRequestObjectResult>(current);
        Assert.IsType<BadRequestObjectResult>(legacy);
        Assert.Equal(0, attendance.CallCount);
    }

    [Fact]
    public async Task Legacy_manual_endpoint_uses_the_same_normalized_registration_path()
    {
        var attendance = new RecordingAttendanceService();
        var controller = new AsistenciasController(new StubTokenService(), new StubCredentialDao(), attendance);

        var result = await controller.Legacy(new AsistenciaRequestDto { Dni = " 12345678 ", Observaciones = "legacy" });

        Assert.IsType<OkObjectResult>(result);
        Assert.Equal(1, attendance.CallCount);
        Assert.Equal(("12345678", "DNI_MANUAL", "legacy"), attendance.LastCall);
    }

    private sealed class RecordingAttendanceService : IAttendanceRegistrationService
    {
        public int CallCount { get; private set; }
        public (string Dni, string Method, string? Detail)? LastCall { get; private set; }

        public Task<AttendanceRegistrationResult> RegisterAsync(string dni, string method, string? detail)
        {
            CallCount++;
            LastCall = (dni, method, detail);
            return Task.FromResult(new AttendanceRegistrationResult(true, true, "ok", 0, 0));
        }
    }

    private sealed class StubTokenService : ICredentialTokenService
    {
        public string Create(Guid id) => throw new NotSupportedException();
        public CredentialToken? Validate(string token) => null;
    }

    private sealed class StubCredentialDao : ICredentialDao
    {
        public Task<Guid?> GetOrCreateActiveCredentialForPlayerAsync(int playerId, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<string?> GetActiveDniAsync(Guid credentialId, CancellationToken cancellationToken) => Task.FromResult<string?>(null);
        public Task<CredentialPlayerData?> GetPlayerAsync(int playerId, CancellationToken cancellationToken) => throw new NotSupportedException();
    }
}
