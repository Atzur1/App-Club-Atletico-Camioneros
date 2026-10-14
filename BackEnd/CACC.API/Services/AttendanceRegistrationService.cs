using CACC.DAO;

namespace CACC.API.Services;
public sealed record AttendanceRegistrationResult(bool PersonFound,bool AccessAllowed,string Message,decimal DebtTotal,int OverdueInstallments);
public interface IAttendanceRegistrationService { Task<AttendanceRegistrationResult> RegisterAsync(string dni,string method,string? detail); }
public sealed class AttendanceRegistrationService(IAsistenciaDao dao) : IAttendanceRegistrationService
{
    public async Task<AttendanceRegistrationResult> RegisterAsync(string dni,string method,string? detail)
    {
        var debt=await dao.ObtenerEstadoDeudaPorDniAsync(dni); var allowed=debt is null || debt.CantidadCuotasVencidas==0;
        var message=allowed?"Acceso permitido. ¡Bienvenido!":$"Acceso denegado. El jugador posee {debt!.CantidadCuotasVencidas} cuota(s) vencida(s).";
        var observation=$"Method={method}"+(string.IsNullOrWhiteSpace(detail)?"":$"; Detail={detail.Trim()}");
        var saved=await dao.RegistrarAsistenciaAsync(dni,allowed,observation);
        return saved?new(true,allowed,message,debt?.DeudaTotal??0,debt?.CantidadCuotasVencidas??0):new(false,false,"Persona no encontrada con el DNI proporcionado.",0,0);
    }
}
