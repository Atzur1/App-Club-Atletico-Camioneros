import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { capabilityGuard } from './core/guards/capability.guard';
import { Capability } from './core/auth/roles';

const applicationRoutes: Routes = [
  // 1. Redirección inicial: Si entran a la raíz, los mandamos al login
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  // 2. Ruta del componente Login
  {
    path: 'login',
    component: LoginComponent
  },

  // --- RESTO DE TUS RUTAS INTACTAS ---
  {
    path: 'seleccion-portales',
    loadComponent: () =>
      import('./features/admin-seleccion-portales/seleccion-portal.component').then(
        (m) => m.SeleccionPortalComponent
      )
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin-home/admin-home.component').then(
        (m) => m.AdminHomeComponent
      )
  },
  {
    path: 'admin/registro-personas',
    loadComponent: () =>
      import('./features/admin-registro-personas/admin-registro-personas.component').then(
        (m) => m.AdminRegistroPersonasComponent
      )
  },
  {
    path: 'admin/alta-jugador',
    loadComponent: () =>
      import('./features/admin-alta-jugador/admin-alta-jugador.component').then(
        (m) => m.AdminAltaJugadorComponent
      )
  },
  {
    path: 'admin-alta-jugador',
    loadComponent: () =>
      import('./features/admin-alta-jugador/admin-alta-jugador.component').then(
        (m) => m.AdminAltaJugadorComponent
      )
  },
  {
    path: 'admin/lista-jugadores',
    loadComponent: () =>
      import('./features/admin-lista-jugadores/admin-lista-jugadores').then(
        (m) => m.AdminListaJugadores
      )
  },
  { path: 'admin/jugador/:id', redirectTo: 'jugadores/:id' },
  { path: 'admin/ficha-jugador/:id', redirectTo: 'jugadores/:id' },
  { path: 'admin-ficha-jugador/:id', redirectTo: 'jugadores/:id' },
  { path: 'admin-ficha-jugador', redirectTo: 'admin/lista-jugadores', pathMatch: 'full' },
  {
    path: 'admin/editar-perfil/:id',
    loadComponent: () =>
      import('./features/admin-editar-perfil/admin-editar-perfil').then(
        (m) => m.AdminEditarPerfil
      )
  },
  { path: 'admin/editar-perfil', redirectTo: 'admin/lista-jugadores', pathMatch: 'full' },
  {
    path: 'admin-editar-perfil/:id',
    loadComponent: () =>
      import('./features/admin-editar-perfil/admin-editar-perfil').then(
        (m) => m.AdminEditarPerfil
      )
  },
  { path: 'admin-editar-perfil', redirectTo: 'admin/lista-jugadores', pathMatch: 'full' },
  {
    path: 'admin-lista-jugadores',
    loadComponent: () =>
      import('./features/admin-lista-jugadores/admin-lista-jugadores').then(
        (m) => m.AdminListaJugadores
      )
  },
  {
    path: 'admin/categorias',
    loadComponent: () =>
      import('./features/admin-lista-categoria/admin-lista-categoria').then(
        (m) => m.AdminListaCategoria
      )
  },
  {
    path: 'admin/categoria/:id/jugadores',
    loadComponent: () =>
      import('./features/admin-categoria-jugadores/admin-categoria-jugadores').then(
        (m) => m.AdminCategoriaJugadores
      )
  },
  {
    path: 'admin-categoria-jugadores/:id',
    loadComponent: () =>
      import('./features/admin-categoria-jugadores/admin-categoria-jugadores').then(
        (m) => m.AdminCategoriaJugadores
      )
  },
  {
    path: 'admin-categoria-jugadores',
    loadComponent: () =>
      import('./features/admin-categoria-jugadores/admin-categoria-jugadores').then(
        (m) => m.AdminCategoriaJugadores
      )
  },
  {
    path: 'admin/lista-categoria',
    loadComponent: () =>
      import('./features/admin-lista-categoria/admin-lista-categoria').then(
        (m) => m.AdminListaCategoria
      )
  },
  {
    path: 'admin-lista-categoria',
    loadComponent: () =>
      import('./features/admin-lista-categoria/admin-lista-categoria').then(
        (m) => m.AdminListaCategoria
      )
  },
  {
    path: 'admin/categorias/:id/partidos',
    loadComponent: () => import('./features/admin-partidos-categoria/admin-partidos-categoria').then(m => m.AdminPartidosCategoria)
  },
  {
    path: 'admin/staff/ver-ficha/:id',
    loadComponent: () =>
      import('./features/admin-staff-ver-ficha/admin-staff-ver-ficha').then(
        (m) => m.AdminStaffVerFicha
      )
  },
  {
    path: 'admin/staff/ver-ficha',
    loadComponent: () =>
      import('./features/admin-staff-ver-ficha/admin-staff-ver-ficha').then(
        (m) => m.AdminStaffVerFicha
      )
  },
  {
    path: 'admin-staff-ver-ficha/:id',
    loadComponent: () =>
      import('./features/admin-staff-ver-ficha/admin-staff-ver-ficha').then(
        (m) => m.AdminStaffVerFicha
      )
  },
  {
    path: 'admin-staff-ver-ficha',
    loadComponent: () =>
      import('./features/admin-staff-ver-ficha/admin-staff-ver-ficha').then(
        (m) => m.AdminStaffVerFicha
      )
  },
  {
    path: 'admin/staff/editar-ficha/:id',
    loadComponent: () =>
      import('./features/admin-staff-editar-ficha/admin-staff-editar-ficha').then(
        (m) => m.AdminStaffEditarFicha
      )
  },
  {
    path: 'admin/staff/editar-ficha',
    loadComponent: () =>
      import('./features/admin-staff-editar-ficha/admin-staff-editar-ficha').then(
        (m) => m.AdminStaffEditarFicha
      )
  },
  {
    path: 'admin-staff-editar-ficha/:id',
    loadComponent: () =>
      import('./features/admin-staff-editar-ficha/admin-staff-editar-ficha').then(
        (m) => m.AdminStaffEditarFicha
      )
  },
  {
    path: 'admin-staff-editar-ficha',
    loadComponent: () =>
      import('./features/admin-staff-editar-ficha/admin-staff-editar-ficha').then(
        (m) => m.AdminStaffEditarFicha
      )
  },
  {
    path: 'admin/staff',
    loadComponent: () =>
      import('./features/admin-staff/admin-staff.component').then(
        (m) => m.AdminStaffComponent
      )
  },
  {
    path: 'admin-staff',
    loadComponent: () =>
      import('./features/admin-staff/admin-staff.component').then(
        (m) => m.AdminStaffComponent
      )
  },
  {
    path: 'admin/alta-trabajador',
    loadComponent: () =>
      import('./features/admin-alta-trabajador/admin-alta-trabajador.component').then(
        (m) => m.AdminAltaTrabajadorComponent
      )
  },
  {
    path: 'admin-alta-trabajador',
    loadComponent: () =>
      import('./features/admin-alta-trabajador/admin-alta-trabajador.component').then(
        (m) => m.AdminAltaTrabajadorComponent
      )
  },
  {
    path: 'medico',
    loadComponent: () => import('./features/admin-home/admin-home.component').then(m => m.AdminHomeComponent)
  },
  { path: 'medico/ficha-jugador/:id', redirectTo: 'jugadores/:id' },
  { path: 'medico/ficha-jugador', redirectTo: 'medico/lista-jugadores', pathMatch: 'full' },
  { path: 'medico-ficha-jugador/:id', redirectTo: 'jugadores/:id' },
  { path: 'medico-ficha-jugador', redirectTo: 'medico/lista-jugadores', pathMatch: 'full' },
  {
    path: 'medico/editar-ficha/:id',
    loadComponent: () =>
      import('./features/medico-editar-ficha/medico-editar-ficha.component').then(
        (m) => m.MedicoEditarFichaComponent
      )
  },
  {
    path: 'medico-editar-ficha/:id',
    loadComponent: () =>
      import('./features/medico-editar-ficha/medico-editar-ficha.component').then(
        (m) => m.MedicoEditarFichaComponent
      )
  },
  {
    path: 'medico/lista-jugadores',
    loadComponent: () => import('./features/admin-lista-jugadores/admin-lista-jugadores').then(m => m.AdminListaJugadores)
  },
  { path: 'medico-lista-jugadores', redirectTo: 'medico/lista-jugadores', pathMatch: 'full' },
  {
    path: 'medico/categorias',
    loadComponent: () => import('./features/admin-lista-categoria/admin-lista-categoria').then(m => m.AdminListaCategoria)
  },
  { path: 'medico/categoria-jugadores', redirectTo: 'medico/categorias', pathMatch: 'full' },
  {
    path: 'dt',
    loadComponent: () => import('./features/admin-home/admin-home.component').then(m => m.AdminHomeComponent)
  },
  {
    path: 'profesor',
    redirectTo: 'dt',
    pathMatch: 'full'
  },
  { path: 'dt/jugador/:id', redirectTo: 'jugadores/:id' },
  { path: 'dt-ficha-jugador', redirectTo: 'dt-categoria-jugadores', pathMatch: 'full' },
  {
    path: 'dt/categorias',
    loadComponent: () => import('./features/admin-lista-categoria/admin-lista-categoria').then(m => m.AdminListaCategoria)
  },
  { path: 'dt/categoria', redirectTo: 'dt/categorias', pathMatch: 'full' },
  { path: 'dt-categoria', redirectTo: 'dt/categorias', pathMatch: 'full' },
  {
    path: 'dt-categoria-jugadores',
    loadComponent: () => import('./features/admin-lista-jugadores/admin-lista-jugadores').then(m => m.AdminListaJugadores)
  },
  { path: 'dt/categoria-jugadores', redirectTo: 'dt-categoria-jugadores', pathMatch: 'full' },
  {
    path: 'dt-editar-historial',
    loadComponent: () =>
      import('./features/dt-editar-historial/dt-editar-historial').then(
        (m) => m.DtEditarHistorialComponent
      )
  },
  {
    path: 'dt/editar-historial',
    loadComponent: () =>
      import('./features/dt-editar-historial/dt-editar-historial').then(
        (m) => m.DtEditarHistorialComponent
      )
  },
  {
    path: 'coordinador',
    loadComponent: () => import('./features/admin-home/admin-home.component').then(m => m.AdminHomeComponent)
  },
  {
    path: 'coordinador-seleccion-categorias',
    loadComponent: () => import('./features/admin-lista-categoria/admin-lista-categoria').then(m => m.AdminListaCategoria)
  },
  { path: 'coordinador/visualizar-plantel', redirectTo: 'coordinador-seleccion-categorias', pathMatch: 'full' },
  {
    path: 'coordinador/visualizar-staff',
    loadComponent: () =>
      import('./features/coordinador-visualizar-staff/coordinador-visualizar-staff').then(
        (m) => m.CoordinadorVisualizarStaff
      )
  },
  { path: 'coordinador/visualizar-perfil/:id', redirectTo: 'jugadores/:id' },
  {
    path: 'coordinador/visualizar-perfil-staff',
    loadComponent: () =>
      import('./features/coordinador-visualizar-perfil-staff/coordinador-visualizar-perfil-staff').then(
        (m) => m.CoordinadorVisualizarPerfilStaff
      )
  },
  {
    path: 'coordinador/editar-staff',
    loadComponent: () =>
      import('./features/coordinador-editar-staff/coordinador-editar-staff').then(
        (m) => m.CoordinadorEditarStaff
      )
  },
  {
    path: 'coordinador/editar-historial',
    loadComponent: () =>
      import('./features/coordinador-editar-historial/coordinador-editar-historial').then(
        (m) => m.CoordinadorEditarHistorial
      )
  },
  {
    path: 'coordinador-lista-jugadores',
    loadComponent: () => import('./features/admin-lista-jugadores/admin-lista-jugadores').then(m => m.AdminListaJugadores)
  },
  {
    path: 'semaforo-qr',
    loadComponent: () => import('./features/qr-scanner/qr-scanner.component').then(m => m.QrScannerComponent)
  }
];

function capabilitiesFor(path: string): Capability[] {
  if (path.startsWith('medico/editar-ficha') || path.startsWith('medico-editar-ficha')) return ['medical:write'];
  if (path.startsWith('coordinador/editar-') || path.startsWith('dt/editar-') || path.startsWith('dt-editar-')) return ['admin'];
  if (path === 'seleccion-portales' || path.startsWith('admin')) return ['admin'];
  if (path.startsWith('medico')) return ['players:read:all'];
  if (path.startsWith('dt') || path === 'profesor') return ['players:read:assigned'];
  if (path.startsWith('coordinador')) return ['players:read:all'];
  if (path.startsWith('semaforo-qr')) return ['attendance:scan'];
  return [];
}

const protectedRoutes = applicationRoutes.map(route => {
  // Angular resolves redirects before guards. Adding canActivate to a
  // redirect makes the complete router configuration invalid (NG04014).
  if (route.path === '' || route.path === 'login' || route.redirectTo) return route;
  return {
    ...route,
    canActivate: [authGuard, capabilityGuard],
    data: { ...(route.data ?? {}), capabilities: capabilitiesFor(route.path ?? '') }
  };
});

export const routes: Routes = [
  {
    path: 'jugadores/:id',
    loadComponent: () => import('./features/jugador-perfil/jugador-perfil.component').then(m => m.JugadorPerfilComponent),
    canActivate: [authGuard, capabilityGuard],
    data: { capabilities: ['players:read:all', 'players:read:assigned', 'medical:read'] satisfies Capability[] }
  },
  ...protectedRoutes,
  {
    path: 'sin-autorizacion',
    loadComponent: () => import('./features/status-page/status-page.component').then(m => m.StatusPageComponent),
    data: { title: 'Acceso no autorizado', message: 'Tu rol no tiene permiso para acceder a esta pantalla.' }
  },
  {
    path: '**',
    loadComponent: () => import('./features/status-page/status-page.component').then(m => m.StatusPageComponent),
    data: { title: 'Página no encontrada', message: 'La dirección solicitada no existe.' }
  }
];
