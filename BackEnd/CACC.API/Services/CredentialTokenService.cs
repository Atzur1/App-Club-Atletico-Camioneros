using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace CACC.API.Services;

public sealed record CredentialToken(int Version, Guid CredentialId);
public interface ICredentialTokenService { string Create(Guid id); CredentialToken? Validate(string token); }

public sealed class CredentialTokenService : ICredentialTokenService
{
    private readonly byte[] key;
    public CredentialTokenService(IConfiguration configuration)
    {
        var value = configuration["CredentialQr:HmacKey"];
        if (string.IsNullOrWhiteSpace(value)) throw new InvalidOperationException("Configure CredentialQr:HmacKey mediante user-secrets o variable de entorno.");
        try { key = Convert.FromBase64String(value); } catch (FormatException ex) { throw new InvalidOperationException("CredentialQr:HmacKey debe estar en Base64.", ex); }
        if (key.Length < 32) throw new InvalidOperationException("CredentialQr:HmacKey debe contener al menos 256 bits.");
    }
    public string Create(Guid id)
    {
        if (id == Guid.Empty) throw new ArgumentException("Credential ID cannot be empty.", nameof(id));
        var payload = Encode(JsonSerializer.SerializeToUtf8Bytes(new CredentialToken(1, id)));
        return $"{payload}.{Encode(HMACSHA256.HashData(key, Encoding.ASCII.GetBytes(payload)))}";
    }
    public CredentialToken? Validate(string token)
    {
        if (string.IsNullOrWhiteSpace(token)) return null;
        var parts = token.Split('.'); if (parts.Length != 2) return null;
        try
        {
            var supplied = Decode(parts[1]); var expected = HMACSHA256.HashData(key, Encoding.ASCII.GetBytes(parts[0]));
            if (supplied.Length != expected.Length || !CryptographicOperations.FixedTimeEquals(supplied, expected)) return null;
            var value = JsonSerializer.Deserialize<CredentialToken>(Decode(parts[0]));
            return value is { Version: 1 } && value.CredentialId != Guid.Empty ? value : null;
        }
        catch (Exception ex) when (ex is FormatException or JsonException) { return null; }
    }
    private static string Encode(byte[] bytes) => Convert.ToBase64String(bytes).TrimEnd('=').Replace('+','-').Replace('/','_');
    private static byte[] Decode(string value) { var p=value.Replace('-','+').Replace('_','/'); p += (p.Length % 4) switch {2=>"==",3=>"=",0=>"",_=>throw new FormatException()}; return Convert.FromBase64String(p); }
}
