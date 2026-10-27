using System.Security.Claims;

namespace CACC.API.Security;

public interface ICurrentUserAccess
{
    bool IsAdmin { get; }
    bool IsDirectorTecnico { get; }
    bool IsCategoryScoped { get; }
    IReadOnlySet<int> CategoriaIds { get; }
    bool PuedeAccederCategoria(int categoriaId);
    bool PuedeAccederAlgunaCategoria(IEnumerable<int> categoriaIds);
}

public sealed class CurrentUserAccess(IHttpContextAccessor httpContextAccessor) : ICurrentUserAccess
{
    private ClaimsPrincipal User => httpContextAccessor.HttpContext?.User ?? new ClaimsPrincipal();

    public bool IsAdmin => User.IsInRole(AppRoles.Administrador) || User.IsInRole(AppRoles.Tesorero);

    public bool IsDirectorTecnico => User.IsInRole(AppRoles.DirectorTecnico);

    public bool IsCategoryScoped => IsDirectorTecnico || User.IsInRole(AppRoles.PreparadorFisico);

    public IReadOnlySet<int> CategoriaIds => User.FindAll("id_categoria")
        .Select(claim => int.TryParse(claim.Value, out var id) ? id : 0)
        .Where(id => id > 0)
        .ToHashSet();

    public bool PuedeAccederCategoria(int categoriaId) =>
        !IsCategoryScoped || CategoriaIds.Contains(categoriaId);

    public bool PuedeAccederAlgunaCategoria(IEnumerable<int> categoriaIds) =>
        !IsCategoryScoped || PlayerCategoryScope.CanAccess(CategoriaIds, null, categoriaIds);
}
