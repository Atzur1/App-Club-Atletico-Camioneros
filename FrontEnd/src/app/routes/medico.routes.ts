import { Routes } from '@angular/router';
import { responsiveComponent } from './responsive-component';

export const MEDICO_ROUTES: Routes = [
  { path: '', title: 'Portal médico', data: { desktopOwnShell: true }, loadComponent: responsiveComponent(
    () => import('../features/medico-home/medico-home.component').then((m) => m.MedicoHomeComponent),
    () => import('../features/admin-home/admin-home.component').then((m) => m.AdminHomeComponent),
  ) },
  { path: 'jugadores', title: 'Jugadores', loadComponent: responsiveComponent(
    () => import('../features/medico-lista-jugadores/medico-lista-jugadores.component').then((m) => m.MedicoListaJugadoresComponent),
    () => import('../features/admin-lista-jugadores/admin-lista-jugadores').then((m) => m.AdminListaJugadores),
  ) },
  { path: 'jugadores/:id/ficha-medica', title: 'Editar ficha médica', loadComponent: () => import('../features/medico-editar-ficha/medico-editar-ficha.component').then((m) => m.MedicoEditarFichaComponent) },
  { path: 'jugadores/:id/asistencias', title: 'Historial de asistencia', loadComponent: () => import('../features/historial-asistencia/historial-asistencia.component').then((m) => m.HistorialAsistenciaComponent) },
  { path: 'jugadores/:id', title: 'Perfil del jugador', data: { desktopOwnShell: true }, loadComponent: responsiveComponent(
    () => import('../features/medico-ficha-jugador/medico-ficha-jugador.component').then((m) => m.MedicoFichaJugadorComponent),
    () => import('../features/jugador-perfil/jugador-perfil.component').then((m) => m.JugadorPerfilComponent),
  ) },
  { path: 'categorias', title: 'Categorías', loadComponent: responsiveComponent(
    () => import('../features/medico-seleccion-categorias/medico-seleccion-categorias.component').then((m) => m.MedicoSeleccionCategoriasComponent),
    () => import('../features/admin-lista-categoria/admin-lista-categoria').then((m) => m.AdminListaCategoria),
  ) },
  { path: 'categorias/:id', title: 'Plantel de categoría', loadComponent: responsiveComponent(
    () => import('../features/medico-categoria-jugadores/medico-categoria-jugadores.component').then((m) => m.MedicoCategoriaJugadoresComponent),
    () => import('../features/admin-lista-jugadores/admin-lista-jugadores').then((m) => m.AdminListaJugadores),
  ) },
];
