using System.Text.RegularExpressions;
using CACC.API.Authorization;
using CACC.API.Services;
using CACC.DAO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace CACC.API.Controllers;
[ApiController, Route("api/asistencias")]
[Authorize(Roles = RoleNames.Administrador + "," + RoleNames.DonQr)]
public sealed partial class AsistenciasController(ICredentialTokenService tokens, ICredentialDao credentials, IAttendanceRegistrationService attendance) : ControllerBase
{
 [HttpPost("registrar-por-qr")] public async Task<IActionResult> RegisterByQr([FromBody] QrAttendanceRequest request,CancellationToken ct){var token=tokens.Validate(request.QrToken);if(token is null)return BadRequest(new{message="La credencial QR no es válida."});var dni=await credentials.GetActiveDniAsync(token.CredentialId,ct);if(dni is null)return NotFound(new{message="La credencial no existe, fue revocada o está inactiva."});return Result(await attendance.RegisterAsync(dni,"QR",null));}
 [HttpPost("registrar-manual")] public Task<IActionResult> RegisterManual([FromBody] ManualAttendanceRequest request)=>RegisterManualCore(request.Dni,request.Reason);
 [HttpPost("verificar-y-registrar")] public Task<IActionResult> Legacy([FromBody] DTOs.AsistenciaRequestDto request)=>RegisterManualCore(request.Dni,request.Observaciones);
 private async Task<IActionResult> RegisterManualCore(string? rawDni,string? reason){var dni=rawDni?.Trim()??string.Empty;if(!DniPattern().IsMatch(dni))return BadRequest(new{message="Ingresá un DNI válido de 7 u 8 números."});return Result(await attendance.RegisterAsync(dni,"DNI_MANUAL",reason));}
 private IActionResult Result(AttendanceRegistrationResult r)=>r.PersonFound?Ok(new{accesoPermitido=r.AccessAllowed,mensaje=r.Message,deudaTotal=r.DebtTotal,cuotasVencidas=r.OverdueInstallments}):NotFound(new{message=r.Message});
 [GeneratedRegex("^[0-9]{7,8}$")] private static partial Regex DniPattern();
}
public sealed record QrAttendanceRequest(string QrToken);
public sealed record ManualAttendanceRequest(string Dni,string? Reason);
