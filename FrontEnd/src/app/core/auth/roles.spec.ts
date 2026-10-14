import { RoleId, hasCapability } from './roles';

describe('role capabilities', () => {
  it('lets the administrator edit player data and medical records', () => {
    expect(hasCapability(RoleId.Administrador, 'players:write')).toBeTrue();
    expect(hasCapability(RoleId.Administrador, 'medical:read')).toBeTrue();
    expect(hasCapability(RoleId.Administrador, 'medical:write')).toBeTrue();
  });

  it('allows the coordinator to manage category membership but not edit profiles or medical data', () => {
    expect(hasCapability(RoleId.Coordinador, 'categories:membership')).toBeTrue();
    expect(hasCapability(RoleId.Coordinador, 'players:write')).toBeFalse();
    expect(hasCapability(RoleId.Coordinador, 'medical:write')).toBeFalse();
  });

  it('limits the doctor to medical editing', () => {
    expect(hasCapability(RoleId.Medico, 'medical:write')).toBeTrue();
    expect(hasCapability(RoleId.Medico, 'players:write')).toBeFalse();
  });

  it('allows every non-scanner role to read medical records', () => {
    for (const role of Object.values(RoleId).filter((value): value is RoleId => typeof value === 'number' && value !== RoleId.DonQr)) {
      expect(hasCapability(role, 'medical:read')).withContext(`role ${role}`).toBeTrue();
    }
  });

  it('limits coaches and physical trainers to assigned-category reads', () => {
    for (const role of [RoleId.DirectorTecnico, RoleId.PreparadorFisico]) {
      expect(hasCapability(role, 'players:read:assigned')).toBeTrue();
      expect(hasCapability(role, 'players:read:all')).toBeFalse();
      expect(hasCapability(role, 'players:write')).toBeFalse();
    }
  });

  it('keeps Don QR scanning access without medical write access', () => {
    expect(hasCapability(RoleId.DonQr, 'attendance:scan')).toBeTrue();
    expect(hasCapability(RoleId.DonQr, 'players:read:all')).toBeFalse();
    expect(hasCapability(RoleId.DonQr, 'medical:write')).toBeFalse();
    expect(hasCapability(RoleId.DonQr, 'medical:read')).toBeFalse();
  });

  it('does not expose admin-only mutations through the shared sports screens', () => {
    for (const role of [RoleId.Medico, RoleId.DirectorTecnico, RoleId.PreparadorFisico, RoleId.Coordinador]) {
      expect(hasCapability(role, 'admin')).withContext(`role ${role}`).toBeFalse();
      expect(hasCapability(role, 'players:write')).withContext(`role ${role}`).toBeFalse();
    }
    expect(hasCapability(RoleId.Medico, 'categories:membership')).toBeFalse();
    expect(hasCapability(RoleId.Coordinador, 'categories:membership')).toBeTrue();
    expect(hasCapability(RoleId.Administrativo, 'players:read:all')).toBeFalse();
    expect(hasCapability(RoleId.DonQr, 'players:read:assigned')).toBeFalse();
  });
});
