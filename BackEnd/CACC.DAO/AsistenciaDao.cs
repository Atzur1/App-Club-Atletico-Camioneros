using CACC.Entities;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace CACC.DAO
{
    public class AsistenciaDao : IAsistenciaDao
    {
        private readonly string _connectionString;

        public AsistenciaDao(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string no configurado.");
        }

        public async Task<ResultadoIngreso> ProcesarIngresoAsync(string dni, string metodoRegistro)
        {
            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync(IsolationLevel.Serializable);
            try
            {
            const string query = @"SELECT j.PK_id_jugador,
                ISNULL(v.deuda_total, 0) deuda_total,
                ISNULL(v.cantidad_cuotas_vencidas, 0) cantidad_cuotas_vencidas
                FROM JUGADORES j WITH (UPDLOCK, HOLDLOCK)
                INNER JOIN PERSONAS p ON p.PK_id_persona=j.FK_id_persona
                LEFT JOIN VISTA_ESTADO_DEUDA v ON v.FK_id_jugador=j.PK_id_jugador
                WHERE p.dni=@Dni";
            await using var command = new SqlCommand(query, connection, transaction);
            command.Parameters.AddWithValue("@Dni", dni);
            var matches = new List<(int IdJugador, decimal Deuda, int Cuotas)>();
            await using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync()) matches.Add((reader.GetInt32(0), reader.GetDecimal(1), reader.GetInt32(2)));
            }
            if (matches.Count != 1) { await transaction.RollbackAsync(); return new ResultadoIngreso { Error = matches.Count == 0 ? "El DNI no pertenece a un jugador." : "El DNI está asociado a múltiples jugadores." }; }
            var (idJugador, deuda, cuotas) = matches[0];
            var estadoAcceso = cuotas < 2 ? "PERMITIDO" : "DENEGADO";
            var descripcionMetodo = metodoRegistro == "QR" ? "Lectura de credencial QR" : "Registro manual por DNI";
            var observaciones = cuotas switch
            {
                0 => descripcionMetodo,
                1 => $"Posee 1 mes de deuda - {descripcionMetodo}",
                _ => $"Posee {cuotas} meses de deuda - {descripcionMetodo}"
            };
            var result = new ResultadoIngreso { PersonaEncontrada=true, AccesoPermitido=cuotas < 2, EstadoAcceso=estadoAcceso, DeudaTotal=deuda, CuotasVencidas=cuotas };
            const string exists = @"SELECT TOP(1) estado_acceso FROM ASISTENCIAS WITH (UPDLOCK,HOLDLOCK)
                    WHERE FK_id_jugador=@IdJugador AND fecha_hora>=CONVERT(date,GETDATE()) AND fecha_hora<DATEADD(day,1,CONVERT(date,GETDATE()))";
            await using var existsCommand = new SqlCommand(exists, connection, transaction);
            existsCommand.Parameters.AddWithValue("@IdJugador", idJugador);
            var existingState = await existsCommand.ExecuteScalarAsync();
            result.YaRegistrada = existingState != null;
            if (result.YaRegistrada) { result.AsistenciaRegistrada = true; result.EstadoAcceso = Convert.ToString(existingState) ?? estadoAcceso; await transaction.CommitAsync(); return result; }
            const string insert = @"INSERT INTO ASISTENCIAS(FK_id_jugador,fecha_hora,estado_acceso,observaciones)
                    VALUES(@IdJugador,GETDATE(),@EstadoAcceso,@Observaciones)";
            await using var insertCommand = new SqlCommand(insert, connection, transaction);
            insertCommand.Parameters.AddWithValue("@IdJugador", idJugador);
            insertCommand.Parameters.Add("@EstadoAcceso", SqlDbType.VarChar, 50).Value = estadoAcceso;
            insertCommand.Parameters.Add("@Observaciones", SqlDbType.VarChar, 500).Value = observaciones;
            result.AsistenciaRegistrada = await insertCommand.ExecuteNonQueryAsync() == 1;
            await transaction.CommitAsync();
            return result;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IReadOnlyList<Asistencia>> ObtenerHistorialJugadorAsync(
            int idJugador,
            DateTime? desde,
            DateTime? hasta,
            string? estado)
        {
            const string query = @"SELECT PK_id_asistencia, FK_id_jugador, FK_id_staff,
                    fecha_hora, estado_acceso, observaciones
                FROM ASISTENCIAS
                WHERE FK_id_jugador = @IdJugador
                  AND (@Desde IS NULL OR fecha_hora >= @Desde)
                  AND (@HastaExclusiva IS NULL OR fecha_hora < @HastaExclusiva)
                  AND (@Estado IS NULL OR estado_acceso = @Estado)
                ORDER BY fecha_hora DESC, PK_id_asistencia DESC";

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            await using var command = new SqlCommand(query, connection);
            command.Parameters.Add("@IdJugador", SqlDbType.Int).Value = idJugador;
            command.Parameters.Add("@Desde", SqlDbType.DateTime).Value =
                desde.HasValue ? desde.Value.Date : DBNull.Value;
            command.Parameters.Add("@HastaExclusiva", SqlDbType.DateTime).Value =
                hasta.HasValue ? hasta.Value.Date.AddDays(1) : DBNull.Value;
            command.Parameters.Add("@Estado", SqlDbType.VarChar, 50).Value =
                string.IsNullOrWhiteSpace(estado) ? DBNull.Value : estado.Trim();

            var asistencias = new List<Asistencia>();
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                asistencias.Add(new Asistencia
                {
                    IdAsistencia = reader.GetInt32(0),
                    IdJugador = reader.GetInt32(1),
                    IdStaff = reader.IsDBNull(2) ? null : reader.GetInt32(2),
                    FechaHora = reader.GetDateTime(3),
                    EstadoAcceso = reader.IsDBNull(4) ? string.Empty : reader.GetString(4),
                    Observaciones = reader.IsDBNull(5) ? null : reader.GetString(5)
                });
            }

            return asistencias;
        }
    }
}
