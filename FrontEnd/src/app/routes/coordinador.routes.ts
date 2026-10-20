import { Routes } from '@angular/router';
import { responsiveComponent } from './responsive-component';

export const COORDINADOR_ROUTES: Routes = [
  { path: '', title: 'Coordinación', data: { desktopOwnShell: true }, loadComponent: responsiveComponent(
    () => import('../features/dashboard-coordinador/dashboard-coordinador').then((m) => m.DashboardCoordinador),
    () => import('../features/admin-home/admin-home.component').then((m) => m.AdminHomeComponent),
  ) },
  { path: 'jugadores', title: 'Jugadores', loadComponent: responsiveComponent(
    () => import('../features/coordinador-lista-jugadores/coordinador-lista-jugadores').then((m) => m.CoordinadorListaJugadores),
    () => import('../features/admin-lista-jugadores/admin-lista-jugadores').then((m) => m.AdminListaJugadores),
  ) },
  { path: 'jugadores/:id/asistencias', title: 'Historial de asistencia', loadComponent: () => import('../features/historial-asistencia/historial-asistencia.component').then((m) => m.HistorialAsistenciaComponent) },
  { path: 'jugadores/:id', title: 'Perfil del jugador', data: { desktopOwnShell: true }, loadComponent: responsiveComponent(
    () => import('../features/coordinador-visualizar-perfil/coordinador-visualizar-perfil').then((m) => m.CoordinadorVisualizarPerfil),
    () => import('../features/jugador-perfil/jugador-perfil.component').then((m) => m.JugadorPerfilComponent),
  ) },
  { path: 'jugadores/:id/ficha-medica', title: 'Ficha médica', data: { desktopOwnShell: true }, loadComponent: responsiveComponent(
    () => import('../features/coordinador-medical-page/coordinador-medical-page').then((m) => m.CoordinadorMedicalPage),
    () => import('../features/jugador-perfil/jugador-perfil.component').then((m) => m.JugadorPerfilComponent),
  ) },
  { path: 'categorias', title: 'Categorías', loadComponent: responsiveComponent(
    () => import('../features/coordinador-seleccion-categorias/coordinador-seleccion-categorias').then((m) => m.CoordinadorSeleccionCategorias),
    () => import('../features/admin-lista-categoria/admin-lista-categoria').then((m) => m.AdminListaCategoria),
  ) },
  { path: 'categorias/:id', title: 'Editar plantel de categoría', data: { desktopOwnShell: true }, loadComponent: responsiveComponent(
    () => import('../features/coordinador-visualizar-plantel/coordinador-visualizar-plantel').then((m) => m.CoordinadorVisualizarPlantel),
    () => import('../features/admin-categoria-jugadores/admin-categoria-jugadores').then((m) => m.AdminCategoriaJugadores),
  ) },
];
