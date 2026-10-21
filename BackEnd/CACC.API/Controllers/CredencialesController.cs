using CACC.API.Services;
using CACC.DAO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CACC.API.Security;

namespace CACC.API.Controllers
{
    [ApiController]
    [Route("api/credenciales")]
    [Authorize(Roles = AppRoles.Administradores)]
    public class CredencialesController : ControllerBase
    {
        private readonly IQrService _qrService;
        private readonly ICredentialDao _credentialDao;
        private readonly ICredentialTokenService _tokenService;
        private readonly ICredentialPdfService _pdfService;

        public CredencialesController(
            IQrService qrService,
            ICredentialDao credentialDao,
            ICredentialTokenService tokenService,
            ICredentialPdfService pdfService)
        {
            _qrService = qrService;
            _credentialDao = credentialDao;
            _tokenService = tokenService;
            _pdfService = pdfService;
        }

        [HttpGet("jugador/{idJugador}/pdf")]
        public async Task<IActionResult> DescargarCredencialJugador(int idJugador)
        {
            var cancellationToken = HttpContext?.RequestAborted ?? CancellationToken.None;
            var jugador = await _credentialDao.GetPlayerAsync(idJugador, cancellationToken);
            if (jugador == null)
            {
                return NotFound(new { message = "Jugador no encontrado para generar credencial." });
            }

            var credentialId = await _credentialDao.GetOrCreateActiveCredentialForPlayerAsync(
                idJugador, cancellationToken);
            if (credentialId is null)
            {
                return NotFound(new { message = "No se encontró la persona asociada al jugador." });
            }

            var qrBytes = _qrService.GenerarQrCodePng(_tokenService.Create(credentialId.Value));
            byte[] pdfBytes = _pdfService.Generate(new CredentialPdfData(
                jugador.FirstName, jugador.LastName, jugador.Dni, qrBytes));
            string fileName = $"credencial_jugador_{idJugador}.pdf";

            return File(pdfBytes, "application/pdf", fileName);
        }
    }
}
