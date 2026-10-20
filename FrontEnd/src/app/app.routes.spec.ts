import { routes } from './app.routes';
import { MainLayout } from './layout/main-layout/main-layout';
import { ADMIN_ROUTES } from './routes/admin.routes';

describe('critical application routes', () => {
  it('protects every role portal with both matching and activation guards', () => {
    for (const path of ['admin', 'coordinador', 'medico', 'dt', 'semaforo-qr']) {
      const route = routes.find((candidate) => candidate.path === path);
      expect(route).withContext(`route ${path}`).toBeDefined();
      expect(route?.canMatch?.length).withContext(`canMatch ${path}`).toBeGreaterThan(0);
      expect(route?.canActivate?.length).withContext(`canActivate ${path}`).toBeGreaterThan(0);
    }
  });

  it('keeps access denied before the terminal wildcard route', () => {
    const deniedIndex = routes.findIndex((route) => route.path === 'acceso-denegado');
    const wildcardIndex = routes.findIndex((route) => route.path === '**');

    expect(deniedIndex).toBeGreaterThanOrEqual(0);
    expect(wildcardIndex).toBe(routes.length - 1);
    expect(deniedIndex).toBeLessThan(wildcardIndex);
  });

  it('renders the protected portal selector outside MainLayout', async () => {
    const portalIndex = routes.findIndex((route) => route.path === 'admin/portales');
    const adminIndex = routes.findIndex((route) => route.path === 'admin');
    const route = routes[portalIndex];

    expect(portalIndex).toBeGreaterThanOrEqual(0);
    expect(portalIndex).toBeLessThan(adminIndex);
    expect(route.component).not.toBe(MainLayout);
    expect(route.loadComponent).toBeDefined();
    expect(route.canMatch?.length).toBeGreaterThan(0);
    expect(route.canActivate?.length).toBeGreaterThan(0);
    expect(route.data?.['roles']).toEqual(['admin']);
    expect((await (route.loadComponent!() as Promise<any>)).name).toMatch(/^SeleccionPortalComponent/);
    expect(ADMIN_ROUTES.some((candidate) => candidate.path === 'portales')).toBeFalse();
  });

  it('preserves the legacy portal selector redirect', () => {
    const route = routes.find((candidate) => candidate.path === 'seleccion-portales');
    expect(route?.redirectTo).toBe('admin/portales');
    expect(route?.pathMatch).toBe('full');
  });
});
