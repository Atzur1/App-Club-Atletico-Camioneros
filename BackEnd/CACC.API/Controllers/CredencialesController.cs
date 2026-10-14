using CACC.API.Authorization;
using CACC.API.Services;
using CACC.DAO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace CACC.API.Controllers;
[ApiController,Route("api/credenciales"),Authorize]
public sealed class CredencialesController(ICredentialDao credentials,ICredentialTokenService tokens,IQrService qr,ICredentialPdfService pdf):ControllerBase
{
 [HttpGet("jugador/{idJugador:int}/pdf"),Authorize(Roles=RoleNames.Administrador)]
 public async Task<IActionResult> Download(int idJugador,CancellationToken ct){var player=await credentials.GetPlayerAsync(idJugador,ct);if(player is null)return NotFound(new{message="Jugador no encontrado para generar credencial."});var credentialId=await credentials.GetOrCreateActiveCredentialForPlayerAsync(idJugador,ct);if(credentialId is null)return NotFound(new{message="No se encontró la persona asociada al jugador."});var bytes=pdf.Generate(new(player.FirstName,player.LastName,player.Dni,qr.GenerarQrCodePng(tokens.Create(credentialId.Value))));return File(bytes,"application/pdf",$"credencial_jugador_{idJugador}.pdf");}
}
