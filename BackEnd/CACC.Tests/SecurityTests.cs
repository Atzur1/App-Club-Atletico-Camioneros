using CACC.API.Security;
using Xunit;

namespace CACC.Tests;

public class SecurityTests
{
    [Fact]
    public void AdministratorRole_IsIncludedInEveryRelevantCapabilityGroup()
    {
        Assert.Contains(AppRoles.Administrador, AppRoles.Administradores.Split(','));
        Assert.Contains(AppRoles.Administrador, AppRoles.LecturaDeportiva.Split(','));
        Assert.Contains(AppRoles.Administrador, AppRoles.LecturaGeneral.Split(','));
    }

    [Fact]
    public void CoordinatorAndDoctor_AreReadersButNotAdministrators()
    {
        var readers = AppRoles.LecturaGeneral.Split(',');
        var administrators = AppRoles.Administradores.Split(',');
        Assert.Contains(AppRoles.Coordinador, readers);
        Assert.Contains(AppRoles.Medico, readers);
        Assert.DoesNotContain(AppRoles.Coordinador, administrators);
        Assert.DoesNotContain(AppRoles.Medico, administrators);
    }

    [Fact]
    public void PlayerScope_AllowsPrimaryCategoryMembership() =>
        Assert.True(PlayerCategoryScope.CanAccess([10, 20], 20, []));

    [Fact]
    public void PlayerScope_AllowsSecondaryCategoryMembership() =>
        Assert.True(PlayerCategoryScope.CanAccess([10, 20], 30, [20, 40]));

    [Fact]
    public void PlayerScope_RejectsUnassignedPlayer() =>
        Assert.False(PlayerCategoryScope.CanAccess([10, 20], 30, [40, 50]));
}
