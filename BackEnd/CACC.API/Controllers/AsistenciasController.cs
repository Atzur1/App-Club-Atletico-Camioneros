using CACC.API.DTOs;
using CACC.DAO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CACC.API.Security;

namespace CACC.API.Controllers
{
    [ApiController]
    [Route("api/asistencias")]
    [Authorize(Roles = AppRoles.Administradores + "," + AppRoles.DonQr)]
    public class AsistenciasController : ControllerBase
    {
        private readonly IAsistenciaDao _asistenciaDao;

        public AsistenciasController(IAsistenciaDao asistenciaDao)
        {
            _asistenciaDao = asistenciaDao;
        }

        [HttpPost("verificar-y-registrar")]
        public async Task<IActionResult> VerificarYRegistrar([FromBody] AsistenciaRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Dni))
            {
                return BadRequest(new { message = "El DNI es obligatorio." });
            }

            var resultado = await _asistenciaDao.ProcesarIngresoAsync(request.Dni.Trim(), request.Observaciones ?? string.Empty);
            if (!resultado.PersonaEncontrada)
            {
                return UnprocessableEntity(new { message = resultado.Error ?? "No se pudo identificar un jugador inequívoco." });
            }
            var mensaje = resultado.YaRegistrada ? "La asistencia ya estaba registrada para hoy." : resultado.CuotasVencidas switch {
                0 => "Asistencia registrada. Acceso permitido.",
                1 => "Asistencia registrada. El jugador posee un mes de deuda.",
                _ => $"Acceso denegado. El jugador posee {resultado.CuotasVencidas} cuotas vencidas y la asistencia no fue registrada."
            };
            return Ok(new
            {
                accesoPermitido = resultado.AccesoPermitido,
                asistenciaRegistrada = resultado.AsistenciaRegistrada,
                yaRegistrada = resultado.YaRegistrada,
                mensaje,
                deudaTotal = resultado.DeudaTotal,
                cuotasVencidas = resultado.CuotasVencidas
            });
        }
    }
}
