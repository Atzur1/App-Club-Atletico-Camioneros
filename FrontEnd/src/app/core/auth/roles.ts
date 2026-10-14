export enum RoleId {
  Administrador = 1,
  Administrativo = 2,
  Medico = 3,
  DirectorTecnico = 4,
  DonQr = 5,
  PreparadorFisico = 6,
  Coordinador = 7
}

export type Capability =
  | 'admin' | 'players:read:all' | 'players:read:assigned' | 'players:write'
  | 'medical:read' | 'medical:write' | 'categories:read:all'
  | 'categories:read:assigned' | 'categories:membership' | 'attendance:scan';

const capabilitiesByRole: Record<RoleId, readonly Capability[]> = {
  [RoleId.Administrador]: ['admin', 'players:read:all', 'players:write', 'medical:read', 'medical:write', 'categories:read:all', 'categories:membership', 'attendance:scan'],
  [RoleId.Administrativo]: ['medical:read'],
  [RoleId.Medico]: ['players:read:all', 'medical:read', 'medical:write', 'categories:read:all'],
  [RoleId.DirectorTecnico]: ['players:read:assigned', 'medical:read', 'categories:read:assigned'],
  [RoleId.DonQr]: ['attendance:scan'],
  [RoleId.PreparadorFisico]: ['players:read:assigned', 'medical:read', 'categories:read:assigned'],
  [RoleId.Coordinador]: ['players:read:all', 'medical:read', 'categories:read:all', 'categories:membership']
};

export function hasCapability(roleId: RoleId | null, capability: Capability): boolean {
  return roleId !== null && (capabilitiesByRole[roleId]?.includes(capability) ?? false);
}
