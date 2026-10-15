using CACC.DAO;
using CACC.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CACC.API.Security;

namespace CACC.API.Controllers
{
    [ApiController]
    [Route("api/fichas-medicas")]
    [Authorize(Roles = AppRoles.LecturaDeportiva)]
    public class FichasMedicasController : ControllerBase
    {
        private readonly IFichaMedicaDao _fichaMedicaDao;
        private readonly IJugadorDao _jugadorDao;
        private readonly ICurrentUserAccess _access;

        public FichasMedicasController(IFichaMedicaDao fichaMedicaDao, IJugadorDao jugadorDao, ICurrentUserAccess access)
        {
            _fichaMedicaDao = fichaMedicaDao;
            _jugadorDao = jugadorDao;
            _access = access;
        }

        [HttpGet("jugador/{idJugador}")]
        public async Task<IActionResult> GetFichaPorJugador(int idJugador)
        {
            var jugador = await _jugadorDao.ObtenerPorIdAsync(idJugador);
            if (jugador == null)
            {
                return NotFound(new { message = "Jugador no encontrado." });
            }

            if (!_access.PuedeAccederAlgunaCategoria(jugador.CategoriasIds)) return Forbid();

            var ficha = await _fichaMedicaDao.ObtenerPorJugadorIdAsync(idJugador);
            if (ficha == null)
            {
                return NotFound(new { message = "Ficha médica no encontrada para este jugador." });
            }

            return Ok(ficha);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = AppRoles.Administradores + "," + AppRoles.Medico)]
        public async Task<IActionResult> ActualizarFicha(int id, [FromBody] FichaMedica ficha)
        {
            if (id != ficha.IdFichaMedica)
            {
                return BadRequest(new { message = "El ID de la ficha no coincide." });
            }

            var actualizada = await _fichaMedicaDao.ActualizarAsync(ficha);
            if (!actualizada)
            {
                return NotFound(new { message = "No se pudo actualizar la ficha médica." });
            }

            return Ok(new { message = "Ficha médica actualizada correctamente." });
        }
    }
}
