using CACC.API.DTOs;
using CACC.DAO;
using CACC.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CACC.API.Authorization;

namespace CACC.API.Controllers
{
    [ApiController]
    [Route("api/categorias")]
    [Authorize]
    public class CategoriasController : ControllerBase
    {
        private readonly ICategoriaDao _categoriaDao;
        private readonly IUserScopeService _scope;

        public CategoriasController(ICategoriaDao categoriaDao, IUserScopeService scope)
        {
            _categoriaDao = categoriaDao;
            _scope = scope;
        }

        [HttpGet]
        [Authorize(Roles = RoleNames.LecturaDeportiva)]
        public async Task<IActionResult> GetCategorias()
        {
            var categoriasConConteo = await _categoriaDao.ObtenerTodasConConteoAsync();
            if (_scope.GetRoleId(User) is 4 or 6)
            {
                var assigned = _scope.GetAssignedCategoryIds(User);
                categoriasConConteo = categoriasConConteo.Where(c => assigned.Contains(c.IdCategoria));
            }

            var response = categoriasConConteo.Select(c => new CategoriaResponseDto
            {
                IdCategoria = c.IdCategoria,
                NombreCategoria = c.NombreCategoria,
                Asociacion = c.Asociacion,
                CantidadJugadores = c.CantidadJugadores,
                CantidadStaff = c.CantidadStaff
            });

            return Ok(response);
        }

        [HttpGet("simple")]
        [Authorize(Roles = RoleNames.LecturaDeportiva)]
        public async Task<IActionResult> GetCategoriasSimple()
        {
            var categorias = await _categoriaDao.ObtenerTodasAsync();
            if (_scope.GetRoleId(User) is 4 or 6)
            {
                var assigned = _scope.GetAssignedCategoryIds(User);
                categorias = categorias.Where(c => assigned.Contains(c.IdCategoria));
            }
            return Ok(categorias);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = RoleNames.LecturaDeportiva)]
        public async Task<IActionResult> GetCategoriaPorId(int id)
        {
            if (!await _scope.CanReadCategoryAsync(User, id)) return Forbid();
            var cat = await _categoriaDao.ObtenerPorIdAsync(id);
            if (cat == null)
            {
                return NotFound(new { message = $"Categoría con ID {id} no encontrada." });
            }

            return Ok(new CategoriaResponseDto
            {
                IdCategoria = cat.IdCategoria,
                NombreCategoria = cat.NombreCategoria
            });
        }

        [HttpPost]
        [Authorize(Roles = RoleNames.Administrador)]
        public async Task<IActionResult> CrearCategoria([FromBody] CategoriaCreateUpdateDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.NombreCategoria))
            {
                return BadRequest(new { message = "El nombre de la categoría es obligatorio." });
            }

            int idNueva = await _categoriaDao.CrearAsync(dto.NombreCategoria, dto.Asociacion);
            return StatusCode(201, new { idCategoria = idNueva, nombreCategoria = dto.NombreCategoria.Trim(), asociacion = dto.Asociacion });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = RoleNames.Administrador)]
        public async Task<IActionResult> ActualizarCategoria(int id, [FromBody] CategoriaCreateUpdateDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.NombreCategoria))
            {
                return BadRequest(new { message = "El nombre de la categoría es obligatorio." });
            }

            bool actualizado = await _categoriaDao.ActualizarAsync(id, dto.NombreCategoria, dto.Asociacion);
            if (!actualizado)
            {
                return NotFound(new { message = $"Categoría con ID {id} no encontrada." });
            }

            return Ok(new { message = "Categoría actualizada con éxito." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = RoleNames.Administrador)]
        public async Task<IActionResult> EliminarCategoria(int id)
        {
            bool ok = await _categoriaDao.EliminarAsync(id);
            if (!ok)
            {
                return NotFound(new { message = $"Categoría con ID {id} no encontrada para eliminar." });
            }

            return Ok(new { message = "Categoría y sus asignaciones eliminadas con éxito." });
        }

        // ==========================================
        // ENDPOINTS: PLANTEL DE JUGADORES
        // ==========================================

        [HttpGet("{id}/jugadores")]
        [Authorize(Roles = RoleNames.LecturaDeportiva)]
        public async Task<IActionResult> GetJugadoresPlantel(int id)
        {
            if (!await _scope.CanReadCategoryAsync(User, id)) return Forbid();
            var plantel = await _categoriaDao.ObtenerJugadoresPorCategoriaAsync(id);

            var response = plantel.Select(j => new JugadorPlantelDto
            {
                IdJugador = j.IdJugador,
                NombreCompleto = j.NombreCompleto,
                Dni = j.Dni,
                PosicionCancha = j.PosicionCancha,
                FechaNacimiento = j.FechaNacimiento
            });

            return Ok(response);
        }

        [HttpGet("{id}/jugadores-disponibles")]
        [Authorize(Roles = RoleNames.Administrador + "," + RoleNames.Coordinador)]
        public async Task<IActionResult> GetJugadoresDisponibles(int id, [FromQuery] string? q)
        {
            var disponibles = await _categoriaDao.ObtenerJugadoresDisponiblesAsync(id, q);

            var response = disponibles.Select(j => new JugadorPlantelDto
            {
                IdJugador = j.IdJugador,
                NombreCompleto = j.NombreCompleto,
                Dni = j.Dni,
                PosicionCancha = j.PosicionCancha,
                FechaNacimiento = j.FechaNacimiento
            });

            return Ok(response);
        }

        [HttpPost("{id}/jugadores")]
        [Authorize(Roles = RoleNames.Administrador + "," + RoleNames.Coordinador)]
        public async Task<IActionResult> AsignarJugador(int id, [FromBody] AsignarJugadorCategoriaDto dto)
        {
            if (dto == null || dto.IdJugador <= 0)
            {
                return BadRequest(new { message = "Debe especificar un jugador válido." });
            }

            await _categoriaDao.AsignarJugadorAsync(id, dto.IdJugador);
            return Ok(new { message = "Jugador asignado a la categoría exitosamente." });
        }

        [HttpDelete("{id}/jugadores/{idJugador}")]
        [Authorize(Roles = RoleNames.Administrador + "," + RoleNames.Coordinador)]
        public async Task<IActionResult> QuitarJugador(int id, int idJugador)
        {
            await _categoriaDao.QuitarJugadorAsync(id, idJugador);
            return Ok(new { message = "Jugador desvinculado de la categoría." });
        }

        // ==========================================
        // ENDPOINTS: CUERPO TÉCNICO (DT / PF)
        // ==========================================

        [HttpGet("{id}/staff")]
        [Authorize(Roles = RoleNames.LecturaDeportivaGlobal)]
        public async Task<IActionResult> GetStaffPlantel(int id)
        {
            var staff = await _categoriaDao.ObtenerStaffPorCategoriaAsync(id);

            var response = staff.Select(s => new StaffPlantelDto
            {
                IdStaff = s.IdStaff,
                NombreCompleto = s.NombreCompleto,
                Dni = s.Dni,
                Rol = s.Rol,
                Email = s.Email
            });

            return Ok(response);
        }

        [HttpGet("{id}/staff-disponibles")]
        [Authorize(Roles = RoleNames.Administrador)]
        public async Task<IActionResult> GetStaffDisponibles(int id, [FromQuery] string? q)
        {
            var disponibles = await _categoriaDao.ObtenerStaffDisponibleAsync(id, q);

            var response = disponibles.Select(s => new StaffPlantelDto
            {
                IdStaff = s.IdStaff,
                NombreCompleto = s.NombreCompleto,
                Dni = s.Dni,
                Rol = s.Rol,
                Email = s.Email
            });

            return Ok(response);
        }

        [HttpPost("{id}/staff")]
        [Authorize(Roles = RoleNames.Administrador)]
        public async Task<IActionResult> AsignarStaff(int id, [FromBody] AsignarStaffCategoriaDto dto)
        {
            if (dto == null || dto.IdStaff <= 0)
            {
                return BadRequest(new { message = "Debe especificar un miembro del staff válido." });
            }

            await _categoriaDao.AsignarStaffAsync(id, dto.IdStaff);
            return Ok(new { message = "Miembro del cuerpo técnico asignado a la categoría exitosamente." });
        }

        [HttpDelete("{id}/staff/{idStaff}")]
        [Authorize(Roles = RoleNames.Administrador)]
        public async Task<IActionResult> QuitarStaff(int id, int idStaff)
        {
            await _categoriaDao.QuitarStaffAsync(id, idStaff);
            return Ok(new { message = "Miembro del cuerpo técnico desvinculado de la categoría." });
        }

        // ==========================================
        // ENDPOINTS: HISTORIAL DE PARTIDOS
        // ==========================================

        [HttpGet("{id}/partidos")]
        [Authorize(Roles = RoleNames.LecturaDeportiva)]
        public async Task<IActionResult> GetPartidos(int id)
        {
            if (!await _scope.CanReadCategoryAsync(User, id)) return Forbid();
            var partidos = await _categoriaDao.ObtenerPartidosPorCategoriaAsync(id);
            var response = partidos.Select(p => new PartidoResponseDto
            {
                IdPartido = p.IdPartido,
                IdCategoria = p.IdCategoria,
                Categoria = p.Categoria,
                Fecha = p.Fecha,
                Rival = p.Rival,
                Resultado = p.Resultado,
                Condicion = p.Condicion
            });
            return Ok(response);
        }

        [HttpPost("{id}/partidos")]
        [Authorize(Roles = RoleNames.Administrador)]
        public async Task<IActionResult> CrearPartido(int id, [FromBody] PartidoCreateDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Rival) || string.IsNullOrWhiteSpace(dto.Resultado) || string.IsNullOrWhiteSpace(dto.FechaPartido))
            {
                return BadRequest(new { message = "Fecha, rival y resultado son obligatorios." });
            }

            if (!DateTime.TryParse(dto.FechaPartido, out var fecha))
            {
                return BadRequest(new { message = "Formato de fecha inválido." });
            }

            var partidoAlta = new PartidoAlta
            {
                IdCategoria = id,
                FechaPartido = fecha,
                Rival = dto.Rival.Trim(),
                CondicionLocalia = dto.CondicionLocalia.Trim(),
                Resultado = dto.Resultado.Trim(),
                Observaciones = dto.Observaciones?.Trim(),
                JugadoresMinutos = dto.JugadoresMinutos?.Select(jm => new JugadorMinutoAlta
                {
                    IdJugador = jm.IdJugador,
                    MinutosJugados = jm.MinutosJugados
                }).ToList() ?? new List<JugadorMinutoAlta>()
            };

            int nuevoId = await _categoriaDao.RegistrarPartidoAsync(partidoAlta);
            return StatusCode(201, new { idPartido = nuevoId, message = "Partido registrado con éxito." });
        }
        [HttpGet("{id}/partidos/{idPartido}")]
        [Authorize(Roles = RoleNames.LecturaDeportiva)]
        public async Task<IActionResult> GetPartidoPorId(int id, int idPartido)
        {
            if (!await _scope.CanReadCategoryAsync(User, id)) return Forbid();
            var p = await _categoriaDao.ObtenerPartidoPorIdAsync(idPartido);
            if (p == null)
                return NotFound(new { message = $"Partido con ID {idPartido} no encontrado." });
            if (p.IdCategoria != id) return NotFound(new { message = $"Partido con ID {idPartido} no encontrado en esta categoría." });

            return Ok(p);
        }

        [HttpPut("{id}/partidos/{idPartido}")]
        [Authorize(Roles = RoleNames.Administrador)]
        public async Task<IActionResult> ActualizarPartido(int id, int idPartido, [FromBody] PartidoCreateDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Rival) || string.IsNullOrWhiteSpace(dto.Resultado) || string.IsNullOrWhiteSpace(dto.FechaPartido))
            {
                return BadRequest(new { message = "Fecha, rival y resultado son obligatorios." });
            }

            if (!DateTime.TryParse(dto.FechaPartido, out var fecha))
            {
                return BadRequest(new { message = "Formato de fecha inválido." });
            }

            var partidoEdicion = new PartidoEdicion
            {
                IdPartido = idPartido,
                IdCategoria = id,
                FechaPartido = fecha,
                Rival = dto.Rival.Trim(),
                CondicionLocalia = dto.CondicionLocalia.Trim(),
                Resultado = dto.Resultado.Trim(),
                Observaciones = dto.Observaciones?.Trim(),
                JugadoresMinutos = dto.JugadoresMinutos?.Select(jm => new JugadorMinutoAlta
                {
                    IdJugador = jm.IdJugador,
                    MinutosJugados = jm.MinutosJugados
                }).ToList() ?? new List<JugadorMinutoAlta>()
            };

            bool ok = await _categoriaDao.ActualizarPartidoAsync(partidoEdicion);
            if (!ok)
                return NotFound(new { message = "No se pudo actualizar el partido especificado." });

            return Ok(new { message = "Partido actualizado con éxito." });
        }

        [HttpDelete("{id}/partidos/{idPartido}")]
        [Authorize(Roles = RoleNames.Administrador)]
        public async Task<IActionResult> EliminarPartido(int id, int idPartido)
        {
            bool ok = await _categoriaDao.EliminarPartidoAsync(idPartido);
            if (!ok)
                return NotFound(new { message = "No se encontró el partido a eliminar." });

            return Ok(new { message = "Partido eliminado exitosamente." });
        }
    }
}
