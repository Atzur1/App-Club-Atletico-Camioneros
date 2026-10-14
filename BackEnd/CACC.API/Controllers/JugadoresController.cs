using CACC.API.DTOs;
using CACC.DAO;
using CACC.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CACC.API.Authorization;

namespace CACC.API.Controllers
{
    [ApiController]
    [Route("api/jugadores")]
    [Authorize]
    public class JugadoresController : ControllerBase
    {
        private readonly IJugadorDao _jugadorDao;
        private readonly IUserScopeService _scope;

        public JugadoresController(IJugadorDao jugadorDao, IUserScopeService scope)
        {
            _jugadorDao = jugadorDao;
            _scope = scope;
        }

        [HttpGet]
        [Authorize(Roles = RoleNames.LecturaDeportiva)]
        public async Task<IActionResult> GetJugadores([FromQuery] int? categoriaId)
        {
            IEnumerable<JugadorDetalle> jugadoresDb;
            var roleId = _scope.GetRoleId(User);

            if (roleId is 4 or 6)
            {
                var assigned = _scope.GetAssignedCategoryIds(User);
                if (categoriaId.HasValue && !assigned.Contains(categoriaId.Value)) return Forbid();
                if (categoriaId.HasValue)
                    jugadoresDb = await _jugadorDao.ObtenerPorCategoriaAsync(categoriaId.Value);
                else
                {
                    var all = new List<JugadorDetalle>();
                    foreach (var category in assigned)
                        all.AddRange(await _jugadorDao.ObtenerPorCategoriaAsync(category));
                    jugadoresDb = all.GroupBy(j => j.IdJugador).Select(group => group.First());
                }
            }

            else if (categoriaId.HasValue && categoriaId.Value > 0)
            {
                jugadoresDb = await _jugadorDao.ObtenerPorCategoriaAsync(categoriaId.Value);
            }
            else
            {
                jugadoresDb = await _jugadorDao.ObtenerTodosAsync();
            }

            var response = jugadoresDb.Select(j => new JugadorResponseDto
            {
                IdJugador = j.IdJugador,
                Nombre = j.Nombre,
                Apellido = j.Apellido,
                Dni = j.Dni,
                Genero = j.Genero,
                FechaDeNacimiento = j.FechaDeNacimiento,
                Domicilio = j.Domicilio,
                IdCategoria = j.IdCategoria,
                NombreCategoria = j.NombreCategoria,
                ClubOrigen = j.ClubOrigen,
                FichaMedicaLiga = j.FichaMedicaLiga,
                PosicionCancha = j.PosicionCancha,
                Peso = j.Peso,
                Altura = j.Altura,
                PieHabil = j.PieHabil,
                EstadoCuota = j.EstadoCuota,
                Tutor = j.Tutor == null ? null : new TutorDto
                {
                    Dni = j.Tutor.Dni,
                    Nombre = j.Tutor.Nombre,
                    Apellido = j.Tutor.Apellido,
                    Telefono = j.Tutor.Telefono ?? string.Empty,
                    Email = j.Tutor.Email,
                    Parentesco = j.Tutor.Parentesco
                }
            });

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetJugadorPorId(int id)
        {
            if (!await _scope.CanReadPlayerAsync(User, id)) return Forbid();
            var j = await _jugadorDao.ObtenerPorIdAsync(id);
            if (j == null)
            {
                return NotFound(new { message = "Jugador no encontrado." });
            }

            var response = new JugadorResponseDto
            {
                IdJugador = j.IdJugador,
                Nombre = j.Nombre,
                Apellido = j.Apellido,
                Dni = j.Dni,
                Genero = j.Genero,
                FechaDeNacimiento = j.FechaDeNacimiento,
                Domicilio = j.Domicilio,
                IdCategoria = j.IdCategoria,
                NombreCategoria = j.NombreCategoria,
                ClubOrigen = j.ClubOrigen,
                FichaMedicaLiga = j.FichaMedicaLiga,
                PosicionCancha = j.PosicionCancha,
                Peso = j.Peso,
                Altura = j.Altura,
                PieHabil = j.PieHabil,
                EstadoCuota = j.EstadoCuota,
                Tutor = j.Tutor == null ? null : new TutorDto
                {
                    Dni = j.Tutor.Dni,
                    Nombre = j.Tutor.Nombre,
                    Apellido = j.Tutor.Apellido,
                    Telefono = j.Tutor.Telefono ?? string.Empty,
                    Email = j.Tutor.Email,
                    Parentesco = j.Tutor.Parentesco
                },
                FichaMedica = j.FichaMedica != null ? new FichaMedicaDto
                {
                    GrupoSanguineo = j.FichaMedica.GrupoSanguineo,
                    Patologias = j.FichaMedica.Patologias,
                    HistorialLesiones = j.FichaMedica.HistorialLesiones,
                    Observaciones = j.FichaMedica.Observaciones
                } : null,
                Partidos = j.Partidos?.Select(p => new PartidoDto
                {
                    Fecha = p.Fecha,
                    Rival = p.Rival,
                    Resultado = p.Resultado,
                    Condicion = p.Condicion,
                    Minutos = p.Minutos
                }).ToList() ?? new List<PartidoDto>()
            };

            return Ok(response);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = RoleNames.Administrador)]
        public async Task<IActionResult> ActualizarPerfil(int id, [FromBody] JugadorUpdateDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Datos de actualización inválidos." });
            }

            try
            {
                // 1. Normalización de Altura (cm -> metros) y validación de rango
                decimal? alturaNormalizada = dto.Altura;
                if (alturaNormalizada.HasValue)
                {
                    // Si es mayor a 3, se ingresó en centímetros (ej: 169 cm -> 1.69 m)
                    if (alturaNormalizada.Value > 3.0m)
                    {
                        alturaNormalizada = Math.Round(alturaNormalizada.Value / 100m, 2);
                    }

                    // Validación de límites biológicos razonables (entre 0.50m y 2.50m)
                    if (alturaNormalizada.Value <= 0.50m || alturaNormalizada.Value > 2.50m)
                    {
                        return BadRequest(new { message = "La altura ingresada debe estar entre 0.50 m y 2.50 m (o entre 50 y 250 cm)." });
                    }
                }

                var jugador = new JugadorDetalle
                {
                    Nombre = dto.Nombre,
                    Apellido = dto.Apellido,
                    Dni = dto.Dni,
                    FechaDeNacimiento = dto.FechaDeNacimiento,
                    PosicionCancha = dto.Posicion,
                    Peso = dto.Peso,
                    Altura = alturaNormalizada, // Pasamos la altura ya normalizada a metros
                    PieHabil = dto.PieHabil,
                    Partidos = dto.Partidos?.Select(p => new PartidoDetalle
                    {
                        Fecha = p.Fecha,
                        Rival = p.Rival,
                        Minutos = p.Minutos
                    }).ToList() ?? new List<PartidoDetalle>()
                };

                var resultado = await _jugadorDao.ActualizarPerfilAsync(id, jugador);
                if (!resultado)
                {
                    return NotFound(new { message = $"Jugador con ID {id} no encontrado." });
                }

                return Ok(new { message = "Perfil actualizado correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor.", details = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = RoleNames.Administrador)]
        public async Task<IActionResult> CrearJugador([FromBody] JugadorCreateDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Nombre) || string.IsNullOrWhiteSpace(dto.Dni))
            {
                return BadRequest(new { message = "El nombre y el DNI son obligatorios." });
            }

            try
            {
                var jugadorAlta = new JugadorAlta
                {
                    Dni = dto.Dni,
                    Nombre = dto.Nombre,
                    Apellido = dto.Apellido,
                    FechaNacimiento = dto.FechaNacimiento,
                    Categoria = dto.Categoria,
                    Posicion = dto.Posicion,
                    ClubOrigen = dto.ClubOrigen,
                    AptoFisico = dto.AptoFisico,
                    Tutor = dto.Tutor == null ? null : new TutorAlta
                    {
                        Dni = dto.Tutor.Dni,
                        Nombre = dto.Tutor.Nombre,
                        Apellido = dto.Tutor.Apellido,
                        Telefono = dto.Tutor.Telefono,
                        Email = dto.Tutor.Email,
                        Parentesco = dto.Tutor.Parentesco
                    }
                };

                int nuevoId = await _jugadorDao.CrearAsync(jugadorAlta);

                return StatusCode(201, new
                {
                    message = "Jugador creado con éxito.",
                    idJugador = nuevoId,
                    dni = dto.Dni,
                    nombre = dto.Nombre,
                    apellido = dto.Apellido
                });
            }
            catch (SqlException ex) when (ex.Number == 2627 || ex.Number == 2601)
            {
                return StatusCode(409, new { message = "Ya existe un jugador con ese DNI." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno al crear el jugador.", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = RoleNames.Administrador)]
        public async Task<IActionResult> EliminarJugador(int id)
        {
            try
            {
                var eliminado = await _jugadorDao.EliminarAsync(id);
                if (!eliminado)
                {
                    return NotFound(new { message = $"Jugador con ID {id} no encontrado." });
                }

                return Ok(new { message = "Jugador eliminado correctamente del club." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno al eliminar el jugador.", details = ex.Message });
            }
        }

        [HttpPut("{id}/tutor")]
        [Authorize(Roles = RoleNames.Administrador)]
        public async Task<IActionResult> GuardarTutor(int id, [FromBody] GuardarTutorDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Dni) || string.IsNullOrWhiteSpace(dto.Nombre) || string.IsNullOrWhiteSpace(dto.Apellido) || string.IsNullOrWhiteSpace(dto.Telefono))
            {
                return BadRequest(new { message = "DNI, nombre, apellido y teléfono del tutor son obligatorios." });
            }

            bool ok = await _jugadorDao.GuardarTutorAsync(
                id,
                dto.Dni.Trim(),
                dto.Nombre.Trim(),
                dto.Apellido.Trim(),
                string.IsNullOrWhiteSpace(dto.Parentesco) ? "Padre" : dto.Parentesco.Trim(),
                dto.Telefono.Trim(),
                dto.Email?.Trim()
            );

            if (!ok)
            {
                return NotFound(new { message = $"Jugador con ID {id} no encontrado." });
            }

            return Ok(new { message = "Tutor guardado y vinculado con éxito." });
        }

        [HttpGet("tutores/{dni}")]
        [Authorize(Roles = RoleNames.Administrador)]
        public async Task<IActionResult> BuscarTutorPorDni(string dni)
        {
            if (string.IsNullOrWhiteSpace(dni))
            {
                return BadRequest(new { message = "El DNI del tutor es obligatorio." });
            }

            var tutor = await _jugadorDao.BuscarTutorPorDniAsync(dni.Trim());
            if (tutor == null)
            {
                return NotFound(new { message = "No se encontró ningún tutor registrado con ese DNI." });
            }

            return Ok(new TutorDto
            {
                Dni = tutor.Dni,
                Nombre = tutor.Nombre,
                Apellido = tutor.Apellido,
                Telefono = tutor.Telefono,
                Email = tutor.Email,
                Parentesco = tutor.Parentesco
            });
        }
    }
}
