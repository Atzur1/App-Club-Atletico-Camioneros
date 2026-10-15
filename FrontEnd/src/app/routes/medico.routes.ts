import { Routes } from '@angular/router';
export const MEDICO_ROUTES: Routes = [
  { path: '', title: 'Portal médico', loadComponent: () => import('../features/medico-home/medico-home.component').then((m) => m.MedicoHomeComponent) },
  { path: 'jugadores', title: 'Jugadores', loadComponent: () => import('../features/medico-lista-jugadores/medico-lista-jugadores.component').then((m) => m.MedicoListaJugadoresComponent) },
  { path: 'jugadores/:id/ficha-medica', title: 'Editar ficha médica', loadComponent: () => import('../features/medico-editar-ficha/medico-editar-ficha.component').then((m) => m.MedicoEditarFichaComponent) },
  { path: 'jugadores/:id', title: 'Perfil del jugador', loadComponent: () => import('../features/medico-ficha-jugador/medico-ficha-jugador.component').then((m) => m.MedicoFichaJugadorComponent) },
  { path: 'categorias', title: 'Categorías', loadComponent: () => import('../features/medico-seleccion-categorias/medico-seleccion-categorias.component').then((m) => m.MedicoSeleccionCategoriasComponent) },
  { path: 'categorias/:id', title: 'Plantel de categoría', loadComponent: () => import('../features/medico-categoria-jugadores/medico-categoria-jugadores.component').then((m) => m.MedicoCategoriaJugadoresComponent) },
];
