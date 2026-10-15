import { DT_ROUTES } from './dt.routes';
import { MEDICO_ROUTES } from './medico.routes';

describe('role-specific visual routes', () => {
  it('keeps every Médico workflow on the original Médico visual components', async () => {
    const expected: Record<string, string> = {
      jugadores: 'MedicoListaJugadoresComponent',
      'jugadores/:id': 'MedicoFichaJugadorComponent',
      'jugadores/:id/ficha-medica': 'MedicoEditarFichaComponent',
      categorias: 'MedicoSeleccionCategoriasComponent',
      'categorias/:id': 'MedicoCategoriaJugadoresComponent',
    };
    for (const [path, componentName] of Object.entries(expected)) {
      const route = MEDICO_ROUTES.find(candidate => candidate.path === path);
      expect(route?.loadComponent).toBeDefined();
      expect((await (route!.loadComponent!() as Promise<any>)).name).toMatch(new RegExp('^' + componentName));
    }
  });

  it('keeps every DT workflow on the original DT visual components', async () => {
    const expected: Record<string, string> = {
      jugadores: 'DtCategoriaJugadoresComponent',
      'jugadores/:id': 'DtFichaJugadorComponent',
      'jugadores/:id/ficha-medica': 'DtFichaJugadorComponent',
      categorias: 'DtCategoriaComponent',
      'categorias/:id': 'DtCategoriaJugadoresComponent',
    };
    for (const [path, componentName] of Object.entries(expected)) {
      const route = DT_ROUTES.find(candidate => candidate.path === path);
      expect(route?.loadComponent).toBeDefined();
      expect((await (route!.loadComponent!() as Promise<any>)).name).toMatch(new RegExp('^' + componentName));
    }
  });
});

