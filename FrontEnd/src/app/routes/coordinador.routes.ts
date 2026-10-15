import { Routes } from '@angular/router';
export const COORDINADOR_ROUTES: Routes = [
  { path: '', title: 'Coordinación', loadComponent: () => import('../features/dashboard-coordinador/dashboard-coordinador').then((m) => m.DashboardCoordinador) },
  { path: 'jugadores', title: 'Jugadores', loadComponent: () => import('../features/admin-lista-jugadores/admin-lista-jugadores').then((m) => m.AdminListaJugadores) },
  { path: 'jugadores/:id', title: 'Perfil del jugador', loadComponent: () => import('../features/admin-ficha-jugador/admin-ficha-jugador').then((m) => m.AdminFichaJugador) },
  { path: 'jugadores/:id/ficha-medica', title: 'Ficha médica', loadComponent: () => import('../features/admin-medical-page/admin-medical-page').then((m) => m.AdminMedicalPage) },
  { path: 'categorias', title: 'Categorías', loadComponent: () => import('../features/admin-lista-categoria/admin-lista-categoria').then((m) => m.AdminListaCategoria) },
  { path: 'categorias/:id', title: 'Editar plantel de categoría', loadComponent: () => import('../features/coordinador-visualizar-plantel/coordinador-visualizar-plantel').then((m) => m.CoordinadorVisualizarPlantel) },
];
