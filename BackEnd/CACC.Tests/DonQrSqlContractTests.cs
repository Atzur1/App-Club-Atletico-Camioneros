using Xunit;
namespace CACC.Tests;
public class DonQrSqlContractTests {
 [Fact] public void SchemaAndDaoUseRealPlayerForeignKey(){
  var root=FindRepositoryRoot(); var schema=File.ReadAllText(Path.Combine(root,"Bbdd CACC.sql")); var dao=ReadDao(root);
  Assert.Contains("[FK_id_jugador] [int] NULL",schema); Assert.Contains("v.FK_id_jugador=j.PK_id_jugador",dao); Assert.Contains("INSERT INTO ASISTENCIAS(FK_id_jugador,fecha_hora,estado_acceso)",dao); Assert.DoesNotContain("INSERT INTO ASISTENCIAS (FK_id_persona",dao); Assert.DoesNotContain("ASISTENCIAS(FK_id_jugador,fecha_hora,estado_acceso,observaciones)",dao);
 }
 [Fact] public void DaoSerializesResolutionAndSameDayIdempotency(){
  var dao=ReadDao(FindRepositoryRoot()); Assert.Contains("IsolationLevel.Serializable",dao); Assert.Contains("JUGADORES j WITH (UPDLOCK, HOLDLOCK)",dao); Assert.Contains("ASISTENCIAS WITH (UPDLOCK,HOLDLOCK)",dao); Assert.Contains("matches.Count != 1",dao); Assert.Contains("fecha_hora>=CONVERT(date,GETDATE())",dao); Assert.Contains("result.YaRegistrada",dao); Assert.Contains("transaction.RollbackAsync()",dao); Assert.Contains("await using var transaction",dao); Assert.Contains("catch",dao); Assert.Contains("await transaction.RollbackAsync()",dao);
 }
 private static string ReadDao(string root)=>File.ReadAllText(Path.Combine(root,"BackEnd","CACC.DAO","AsistenciaDao.cs"));
 private static string FindRepositoryRoot(){for(var d=new DirectoryInfo(AppContext.BaseDirectory);d is not null;d=d.Parent)if(File.Exists(Path.Combine(d.FullName,"Bbdd CACC.sql")))return d.FullName;throw new DirectoryNotFoundException("No se encontró la raíz del repositorio.");}
}

