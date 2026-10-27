import { ADMIN_ROUTES } from './admin.routes';
import { COORDINADOR_ROUTES } from './coordinador.routes';

const setMobileViewport = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({ matches }) as MediaQueryList,
  });
};

describe('Admin and Coordinator legacy visual routes', () => {
  beforeEach(() => setMobileViewport(true));

  const assertComponents = async (routes: typeof ADMIN_ROUTES, expected: Record<string, string>) => {
    for (const [path, name] of Object.entries(expected)) {
      const route = routes.find(candidate => candidate.path === path);
      expect(route?.loadComponent).toBeDefined();
      const component = await (route!.loadComponent!() as Promise<any>);
      expect(component.name).toMatch(new RegExp(`^${name}`));
    }
  };

  it('loads the original Admin presentations for core player/category workflows', async () => {
    await assertComponents(ADMIN_ROUTES, {
      jugadores: 'AdminListaJugadores',
      'jugadores/:id': 'AdminFichaJugador',
      categorias: 'AdminListaCategoria',
      'categorias/:id': 'AdminCategoriaJugadores',
      'jugadores/:id/ficha-medica': 'AdminMedicalPage',
    });
  });

  it('loads the original Coordinator presentations for read/manage workflows', async () => {
    await assertComponents(COORDINADOR_ROUTES, {
      jugadores: 'CoordinadorListaJugadores',
      'jugadores/:id': 'CoordinadorVisualizarPerfil',
      categorias: 'CoordinadorSeleccionCategorias',
      'categorias/:id': 'CoordinadorVisualizarPlantel',
      'jugadores/:id/ficha-medica': 'CoordinadorMedicalPage',
    });
  });

  it('uses the pre-mobile shared presentations on tablet and desktop', async () => {
    setMobileViewport(false);
    await assertComponents(COORDINADOR_ROUTES, {
      jugadores: 'AdminListaJugadores',
      'jugadores/:id': 'JugadorPerfilComponent',
      categorias: 'AdminListaCategoria',
      'categorias/:id': 'AdminCategoriaJugadores',
      'jugadores/:id/ficha-medica': 'JugadorPerfilComponent',
    });
  });
});
