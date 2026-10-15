using System.Text.Json;
using CACC.API.Controllers;
using CACC.API.DTOs;
using CACC.DAO;
using CACC.Entities;
using Microsoft.AspNetCore.Mvc;
using Xunit;
namespace CACC.Tests;
public class AsistenciasControllerTests {
 [Theory][InlineData(0,true,true)][InlineData(1,true,true)][InlineData(2,false,false)]
 public async Task AppliesDebtPolicyAtomically(int cuotas,bool acceso,bool registrada){
  var dao=new FakeDao(new ResultadoIngreso{PersonaEncontrada=true,CuotasVencidas=cuotas,AccesoPermitido=acceso,AsistenciaRegistrada=registrada});
  var result=await new AsistenciasController(dao).VerificarYRegistrar(new AsistenciaRequestDto{Dni="40111222"});
  var ok=Assert.IsType<OkObjectResult>(result); using var doc=JsonDocument.Parse(JsonSerializer.Serialize(ok.Value));
  Assert.Equal(acceso,doc.RootElement.GetProperty("accesoPermitido").GetBoolean()); Assert.Equal(registrada,doc.RootElement.GetProperty("asistenciaRegistrada").GetBoolean()); Assert.Equal(1,dao.Calls);
 }
 [Fact] public async Task ReportsIdempotentSameDayScan(){
  var dao=new FakeDao(new ResultadoIngreso{PersonaEncontrada=true,CuotasVencidas=0,AccesoPermitido=true,AsistenciaRegistrada=true,YaRegistrada=true});
  var result=await new AsistenciasController(dao).VerificarYRegistrar(new AsistenciaRequestDto{Dni="40111222"});
  var ok=Assert.IsType<OkObjectResult>(result); using var doc=JsonDocument.Parse(JsonSerializer.Serialize(ok.Value));
  Assert.True(doc.RootElement.GetProperty("yaRegistrada").GetBoolean()); Assert.Contains("ya estaba registrada",doc.RootElement.GetProperty("mensaje").GetString());
 }
 [Theory][InlineData("El DNI no pertenece a un jugador.")][InlineData("El DNI está asociado a múltiples jugadores.")]
 public async Task RejectsMissingOrAmbiguousPlayers(string error){
  var result=await new AsistenciasController(new FakeDao(new ResultadoIngreso{Error=error})).VerificarYRegistrar(new AsistenciaRequestDto{Dni="40111222"});
  var invalid=Assert.IsType<UnprocessableEntityObjectResult>(result); using var doc=JsonDocument.Parse(JsonSerializer.Serialize(invalid.Value)); Assert.Equal(error,doc.RootElement.GetProperty("message").GetString());
 }
 private sealed class FakeDao(ResultadoIngreso result):IAsistenciaDao { public int Calls{get;private set;} public Task<ResultadoIngreso> ProcesarIngresoAsync(string d,string o){Calls++;return Task.FromResult(result);} }
}

