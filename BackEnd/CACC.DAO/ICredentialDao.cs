namespace CACC.DAO;

public sealed record CredentialPlayerData(int PlayerId, string FirstName, string LastName, string Dni);

public interface ICredentialDao
{
    Task<Guid?> GetOrCreateActiveCredentialForPlayerAsync(int playerId, CancellationToken cancellationToken);
    Task<string?> GetActiveDniAsync(Guid credentialId, CancellationToken cancellationToken);
    Task<CredentialPlayerData?> GetPlayerAsync(int playerId, CancellationToken cancellationToken);
}
