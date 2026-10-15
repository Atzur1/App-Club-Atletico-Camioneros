using CACC.DAO;
using CACC.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CACC.API.Authorization;

namespace CACC.API.Controllers
{
    [ApiController]
    [Route("api/fichas-medicas")]
    [Authorize]
    public class FichasMedicasController : ControllerBase
    {
        private readonly IFichaMedicaDao _fichaMedicaDao;
        private readonly IUserScopeService _scope;

        public FichasMedicasController(IFichaMedicaDao fichaMedicaDao, IUserScopeService scope)
        {
            _fichaMedicaDao = fichaMedicaDao;
            _scope = scope;
        }

        [HttpGet("jugador/{idJugador}")]
        public async Task<IActionResult> GetFichaPorJugador(int idJugador)
        {
            if (!await _scope.CanReadPlayerAsync(User, idJugador)) return Forbid();

            var ficha = await _fichaMedicaDao.ObtenerPorJugadorIdAsync(idJugador);
            if (ficha == null)
            {
                return NotFound(new { message = "Ficha médica no encontrada para este jugador." });
            }

            return Ok(ficha);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = RoleNames.EscrituraFichaMedica)]
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
