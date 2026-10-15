using CACC.API.Services;
using Microsoft.Extensions.Configuration;

namespace CACC.Tests;

public sealed class CredentialTokenServiceTests
{
    private static CredentialTokenService Create(byte marker = 7)
    {
        var key = Convert.ToBase64String(Enumerable.Repeat(marker, 32).ToArray());
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(
            new Dictionary<string, string?> { ["CredentialQr:HmacKey"] = key }).Build();
        return new CredentialTokenService(configuration);
    }

    [Fact]
    public void Token_round_trip_preserves_only_opaque_credential_id()
    {
        var service = Create(); var id = Guid.NewGuid(); var token = service.Create(id);
        var decoded = service.Validate(token);
        Assert.Equal(id, decoded?.CredentialId); Assert.DoesNotContain("dni", token, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Tampered_or_wrong_key_token_is_rejected()
    {
        var token = Create().Create(Guid.NewGuid());
        Assert.Null(Create().Validate(token[..^1] + (token[^1] == 'A' ? "B" : "A")));
        Assert.Null(Create(8).Validate(token));
    }
}
