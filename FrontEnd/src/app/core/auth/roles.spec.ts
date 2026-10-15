import { homeForRole, normalizeRole } from './roles';

describe('role helpers', () => {
  it('normalizes API role variants', () => {
    expect(normalizeRole('Administrador')).toBe('admin');
    expect(normalizeRole('Administrador (Tesorero)')).toBe('admin');
    expect(normalizeRole('Médico')).toBe('medico');
    expect(normalizeRole('Director Técnico')).toBe('dt');
    expect(normalizeRole('7')).toBe('coordinador');
    expect(normalizeRole('Don QR')).toBe('don-qr');
  });

  it('rejects unknown roles instead of granting a fallback role', () => {
    expect(normalizeRole('unknown')).toBeNull();
  });

  it('maps every role to its canonical home', () => {
    expect(homeForRole('admin')).toBe('/admin');
    expect(homeForRole('don-qr')).toBe('/semaforo-qr');
  });
});
