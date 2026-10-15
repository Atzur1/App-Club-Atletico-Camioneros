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

        public async Task<ResultadoIngreso> ProcesarIngresoAsync(string dni, string observaciones)
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
            var result = new ResultadoIngreso { PersonaEncontrada=true, AccesoPermitido=cuotas < 2, DeudaTotal=deuda, CuotasVencidas=cuotas };
            if (cuotas < 2)
            {
                const string exists = @"SELECT TOP(1) 1 FROM ASISTENCIAS WITH (UPDLOCK,HOLDLOCK)
                    WHERE FK_id_jugador=@IdJugador AND fecha_hora>=CONVERT(date,GETDATE()) AND fecha_hora<DATEADD(day,1,CONVERT(date,GETDATE()))";
                await using var existsCommand = new SqlCommand(exists, connection, transaction);
                existsCommand.Parameters.AddWithValue("@IdJugador", idJugador);
                result.YaRegistrada = await existsCommand.ExecuteScalarAsync() != null;
                if (result.YaRegistrada) { result.AsistenciaRegistrada = true; await transaction.CommitAsync(); return result; }
                const string insert = @"INSERT INTO ASISTENCIAS(FK_id_jugador,fecha_hora,estado_acceso)
                    VALUES(@IdJugador,GETDATE(),'PERMITIDO')";
                await using var insertCommand = new SqlCommand(insert, connection, transaction);
                insertCommand.Parameters.AddWithValue("@IdJugador", idJugador);
                result.AsistenciaRegistrada = await insertCommand.ExecuteNonQueryAsync() == 1;
            }
            await transaction.CommitAsync();
            return result;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
