namespace CACC.API.Security;

public static class PlayerCategoryScope
{
    public static bool CanAccess(
        IEnumerable<int> assignedCategoryIds,
        int? primaryCategoryId,
        IEnumerable<int> secondaryCategoryIds)
    {
        var assigned = assignedCategoryIds.Where(id => id > 0).ToHashSet();
        if (primaryCategoryId is > 0 && assigned.Contains(primaryCategoryId.Value))
            return true;

        return secondaryCategoryIds.Any(assigned.Contains);
    }
}
