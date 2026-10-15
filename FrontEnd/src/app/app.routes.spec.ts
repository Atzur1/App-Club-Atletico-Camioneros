import { routes } from './app.routes';

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
});
