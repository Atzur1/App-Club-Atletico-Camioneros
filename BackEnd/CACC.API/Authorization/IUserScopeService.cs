using System.Security.Claims;

namespace CACC.API.Authorization;

public interface IUserScopeService
{
    int? GetRoleId(ClaimsPrincipal user);
    IReadOnlySet<int> GetAssignedCategoryIds(ClaimsPrincipal user);
    Task<bool> CanReadCategoryAsync(ClaimsPrincipal user, int categoryId);
    Task<bool> CanReadPlayerAsync(ClaimsPrincipal user, int playerId);
}
