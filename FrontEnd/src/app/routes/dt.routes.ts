import { Routes } from '@angular/router';
import { responsiveComponent } from './responsive-component';

export const DT_ROUTES: Routes = [
  { path: '', title: 'Portal del entrenador', data: { desktopOwnShell: true }, loadComponent: responsiveComponent(
    () => import('../features/dt-home/dt-home.component').then((m) => m.DtHomeComponent),
    () => import('../features/admin-home/admin-home.component').then((m) => m.AdminHomeComponent),
  ) },
  { path: 'jugadores', title: 'Jugadores de mis categorías', loadComponent: responsiveComponent(
    () => import('../features/dt-categoria-jugadores/dt-categoria-jugadores').then((m) => m.DtCategoriaJugadoresComponent),
    () => import('../features/admin-lista-jugadores/admin-lista-jugadores').then((m) => m.AdminListaJugadores),
  ) },
  { path: 'jugadores/:id/asistencias', title: 'Historial de asistencia', loadComponent: () => import('../features/historial-asistencia/historial-asistencia.component').then((m) => m.HistorialAsistenciaComponent) },
  { path: 'jugadores/:id', title: 'Perfil del jugador', data: { desktopOwnShell: true }, loadComponent: responsiveComponent(
    () => import('../features/dt-ficha-jugador/dt-ficha-jugador.component').then((m) => m.DtFichaJugadorComponent),
    () => import('../features/jugador-perfil/jugador-perfil.component').then((m) => m.JugadorPerfilComponent),
  ) },
  { path: 'jugadores/:id/ficha-medica', title: 'Ficha médica', data: { desktopOwnShell: true }, loadComponent: responsiveComponent(
    () => import('../features/dt-ficha-jugador/dt-ficha-jugador.component').then((m) => m.DtFichaJugadorComponent),
    () => import('../features/jugador-perfil/jugador-perfil.component').then((m) => m.JugadorPerfilComponent),
  ) },
  { path: 'categorias', title: 'Mis categorías', loadComponent: responsiveComponent(
    () => import('../features/dt-categoria/dt-categoria.component').then((m) => m.DtCategoriaComponent),
    () => import('../features/admin-lista-categoria/admin-lista-categoria').then((m) => m.AdminListaCategoria),
  ) },
  { path: 'categorias/:id', title: 'Plantel de categoría', loadComponent: responsiveComponent(
    () => import('../features/dt-categoria-jugadores/dt-categoria-jugadores').then((m) => m.DtCategoriaJugadoresComponent),
    () => import('../features/admin-lista-jugadores/admin-lista-jugadores').then((m) => m.AdminListaJugadores),
  ) },
];
