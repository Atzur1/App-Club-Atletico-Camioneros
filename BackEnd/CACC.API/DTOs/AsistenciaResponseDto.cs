using System.Text.Json.Serialization;

namespace CACC.API.DTOs;

public sealed class AsistenciaResponseDto
{
    [JsonPropertyName("idAsistencia")]
    public int IdAsistencia { get; init; }

    [JsonPropertyName("idJugador")]
    public int IdJugador { get; init; }

    [JsonPropertyName("fechaHora")]
    public DateTime FechaHora { get; init; }

    [JsonPropertyName("estadoAcceso")]
    public string EstadoAcceso { get; init; } = string.Empty;

    [JsonPropertyName("observaciones")]
    public string? Observaciones { get; init; }
}
