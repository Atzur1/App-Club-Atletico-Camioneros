export type AppRole = 'admin' | 'coordinador' | 'medico' | 'dt' | 'don-qr';

const roleAliases: Record<string, AppRole> = {
  '1': 'admin',
  tesorero: 'admin',
  administrador: 'admin',
  'administrador (tesorero)': 'admin',
  admin: 'admin',
  '3': 'medico',
  medico: 'medico',
  '4': 'dt',
  dt: 'dt',
  tecnico: 'dt',
  'director tecnico': 'dt',
  entrenador: 'dt',
  '5': 'don-qr',
  qr: 'don-qr',
  'don qr': 'don-qr',
  'don-qr': 'don-qr',
  '7': 'coordinador',
  coordinador: 'coordinador',
};

export function normalizeRole(value: string | null | undefined): AppRole | null {
  if (!value) return null;
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return roleAliases[normalized] ?? null;
}

export function homeForRole(role: AppRole): string {
  return role === 'don-qr' ? '/semaforo-qr' : `/${role}`;
}
