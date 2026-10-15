import { Routes } from '@angular/router';
export const DT_ROUTES: Routes = [
  { path: '', title: 'Portal del entrenador', loadComponent: () => import('../features/dt-home/dt-home.component').then((m) => m.DtHomeComponent) },
  { path: 'jugadores', title: 'Jugadores de mis categorías', loadComponent: () => import('../features/dt-categoria-jugadores/dt-categoria-jugadores').then((m) => m.DtCategoriaJugadoresComponent) },
  { path: 'jugadores/:id', title: 'Perfil del jugador', loadComponent: () => import('../features/dt-ficha-jugador/dt-ficha-jugador.component').then((m) => m.DtFichaJugadorComponent) },
  { path: 'jugadores/:id/ficha-medica', title: 'Ficha médica', loadComponent: () => import('../features/dt-ficha-jugador/dt-ficha-jugador.component').then((m) => m.DtFichaJugadorComponent) },
  { path: 'categorias', title: 'Mis categorías', loadComponent: () => import('../features/dt-categoria/dt-categoria.component').then((m) => m.DtCategoriaComponent) },
  { path: 'categorias/:id', title: 'Plantel de categoría', loadComponent: () => import('../features/dt-categoria-jugadores/dt-categoria-jugadores').then((m) => m.DtCategoriaJugadoresComponent) },
];
