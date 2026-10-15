using CACC.Entities;
namespace CACC.DAO;
public interface IAsistenciaDao { Task<ResultadoIngreso> ProcesarIngresoAsync(string dni,string observaciones); }
