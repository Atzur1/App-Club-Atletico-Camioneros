using System.Text.Json;
using System.Text.Json.Serialization;

namespace CACC.API.DTOs
{
    public class JugadorUpdateDto
    {
        [JsonPropertyName("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [JsonPropertyName("apellido")]
        public string Apellido { get; set; } = string.Empty;

        [JsonPropertyName("dni")]
        public string Dni { get; set; } = string.Empty;

        [JsonPropertyName("fechaNacimiento")]
        public DateTime? FechaDeNacimiento { get; set; }

        [JsonPropertyName("posicion")]
        public string? Posicion { get; set; }

        [JsonPropertyName("peso")]
        public decimal? Peso { get; set; }

        // Convertidor tolerante a comas, puntos y números directos
        [JsonPropertyName("altura")]
        [JsonConverter(typeof(FlexibleDecimalConverter))]
        public decimal? Altura { get; set; }

        [JsonPropertyName("pieHabil")]
        public string? PieHabil { get; set; }

        [JsonPropertyName("fichaMedica")]
        public FichaMedicaUpdateDto? FichaMedica { get; set; }

        [JsonPropertyName("partidos")]
        public List<PartidoUpdateDto> Partidos { get; set; } = new List<PartidoUpdateDto>();
    }

    public class FlexibleDecimalConverter : JsonConverter<decimal?>
    {
        public override decimal? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null)
                return null;

            if (reader.TokenType == JsonTokenType.Number)
                return reader.GetDecimal();

            if (reader.TokenType == JsonTokenType.String)
            {
                var stringValue = reader.GetString()?.Trim().Replace(',', '.');
                if (string.IsNullOrWhiteSpace(stringValue))
                    return null;

                if (decimal.TryParse(stringValue, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var decimalVal))
                    return decimalVal;
            }

            return null;
        }

        public override void Write(Utf8JsonWriter writer, decimal? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
                writer.WriteNumberValue(value.Value);
            else
                writer.WriteNullValue();
        }
    }

    public class FichaMedicaUpdateDto
    {
        [JsonPropertyName("grupoSanguineo")]
        public string? GrupoSanguineo { get; set; }

        [JsonPropertyName("patologias")]
        public string? Patologias { get; set; }

        [JsonPropertyName("historialLesiones")]
        public string? HistorialLesiones { get; set; }

        [JsonPropertyName("observaciones")]
        public string? Observaciones { get; set; }
    }

    public class PartidoUpdateDto
    {
        [JsonPropertyName("fecha")]
        public DateTime Fecha { get; set; }

        [JsonPropertyName("rival")]
        public string Rival { get; set; } = string.Empty;

        [JsonPropertyName("minutos")]
        public int Minutos { get; set; }
    }
}