const CATEGORY_ID_CLAIMS = ['id_categoria', 'categoryIds', 'categoriaIds', 'categoriasIds', 'assignedCategoryIds'];
const CATEGORY_NAME_CLAIMS = ['categories', 'categorias', 'assignedCategories'];

function values(payload: Record<string, unknown>, keys: string[]): unknown[] {
  return Object.entries(payload)
    .filter(([key]) => keys.some((candidate) => key === candidate || key.endsWith(`/${candidate}`)))
    .map(([, value]) => value);
}

function flatten(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap(flatten);
  if (typeof value === 'string' && value.includes(',')) return value.split(',').map((item) => item.trim());
  return [value];
}

export function assignedCategoryScope(token: string | null): { ids: Set<number>; names: Set<string> } {
  const ids = new Set<number>();
  const names = new Set<string>();
  if (!token) return { ids, names };

  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as Record<string, unknown>;
    values(payload, CATEGORY_ID_CLAIMS).flatMap(flatten).forEach((value) => {
      const id = Number(value);
      if (Number.isInteger(id) && id > 0) ids.add(id);
    });
    values(payload, CATEGORY_NAME_CLAIMS).flatMap(flatten).forEach((value) => {
      if (typeof value === 'string' && value.trim()) names.add(value.trim().toLocaleLowerCase('es'));
    });
  } catch {
    // Invalid or legacy tokens intentionally produce an empty, fail-closed DT scope.
  }

  return { ids, names };
}

