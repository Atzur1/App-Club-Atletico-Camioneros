import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JugadorModel } from '../../shared/models/jugador.model';
import { JugadorService } from '../../shared/services/jugador.service';
import { AuthService } from '../../shared/services/auth.service';
import { AdminPopupCredencial } from '../admin-popup-credencial/admin-popup-credencial';

export interface PartidoFichaItem {
  idPartido: number;
  idCategoria: number;
  categoria: string;
  fecha: string;
  rival: string;
  condicion: string;
  resultado: string;
  minutos: number;
}

export interface TutorFichaModel {
  dni?: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  parentesco?: string;
}

export interface JugadorFichaModel extends Omit<JugadorModel, 'partidos' | 'tutor'> {
  domicilio?: string | null;
  tutor?: TutorFichaModel | null;
  partidos: PartidoFichaItem[];
}

@Component({
  selector: 'app-admin-ficha-jugador',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminPopupCredencial],
  templateUrl: './admin-ficha-jugador.html',
  styleUrl: './admin-ficha-jugador.css',
})
export class AdminFichaJugador implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly jugadorService = inject(JugadorService);
  private readonly authService = inject(AuthService);

  jugador: JugadorFichaModel | null = null;
  playerId = '';
  cargando = true;
  noEncontrado = false;
  errorCarga = '';

  categoriaFiltroPartido: string = '';

  mostrarPopupCredencial = false;
  mostrarPopupFichaMedica = false;
  mostrarPopupPartidos = false;

  readonly sinInformar = 'Sin informar';

  menuUsuarioAbierto = false;
  sidebarOculto = false;
  activeTab = 'Jugadores';

  usuarioActual = {
    nombre: 'Cargando...',
    email: '...'
  };

  navItems = [
    { label: 'Inicio', icon: 'home', active: false },
    { label: 'Jugadores', icon: 'group', active: true },
    { label: 'Staff', icon: 'badge', active: false },
    { label: 'Categorias', icon: 'category', active: false }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.cargando = false;
      this.noEncontrado = true;
      return;
    }

    this.playerId = id;
    this.cargarUsuario();
    this.cargarJugador();
  }

  limpiarNombreRol(rol: string): string {
    if (!rol) return '';
    let r = rol.replace(/\s*\([^)]*\)/gi, '').trim();
    if (r.toLowerCase() === 'tesorero') r = 'Administrador';
    return r;
  }

  get tutorNombreCompleto(): string {
    if (this.jugador?.tutor && (this.jugador.tutor.nombre || this.jugador.tutor.apellido)) {
      return `${this.jugador.tutor.nombre || ''} ${this.jugador.tutor.apellido || ''}`.trim();
    }
    return this.sinInformar;
  }

  get esMenorDeEdad(): boolean {
    if (!this.jugador || !this.jugador.fechaNacimiento) return false;
    const [anio, mes, dia] = this.jugador.fechaNacimiento.split('-').map(Number);
    if (!anio || !mes || !dia) return false;

    const hoy = new Date();
    let edadNum = hoy.getFullYear() - anio;
    if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)) {
      edadNum--;
    }
    return edadNum < 18;
  }

  private cargarUsuario(): void {
    const token = this.authService.getToken();
    const rol = this.authService.getRol() || 'Administrador';

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
          || payload.email
          || '';
        this.usuarioActual = {
          nombre: this.limpiarNombreRol(rol),
          email: email
        };
      } catch {
        this.usuarioActual = { nombre: this.limpiarNombreRol(rol), email: '' };
      }
    }
  }

  cargarJugador(): void {
    this.cargando = true;
    this.noEncontrado = false;
    this.errorCarga = '';

    this.jugadorService.obtenerPorId(this.playerId).subscribe({
      next: (data: any) => {
        const fechaRaw = data.fechaDeNacimiento || data.FechaDeNacimiento || '';
        const fechaCorta = fechaRaw ? fechaRaw.split('T')[0] : '';
        const tutorRaw = data.tutor || data.Tutor;

        this.jugador = {
          id: data.idJugador || data.IdJugador || 0,
          dni: data.dni || data.Dni || '',
          nombre: data.nombre || data.Nombre || '',
          apellido: data.apellido || data.Apellido || '',
          fechaNacimiento: fechaCorta,
          categoria: data.nombreCategoria || data.NombreCategoria || '-',
          posicion: data.posicionCancha || data.PosicionCancha || '-',
          clubOrigen: data.clubOrigen || data.ClubOrigen || null,
          aptoFisico: data.fichaMedicaLiga !== undefined ? data.fichaMedicaLiga : (data.FichaMedicaLiga || false),
          tutor: tutorRaw ? {
            dni: tutorRaw.dni || tutorRaw.Dni || '',
            nombre: tutorRaw.nombre || tutorRaw.Nombre || '',
            apellido: tutorRaw.apellido || tutorRaw.Apellido || '',
            telefono: tutorRaw.telefono || tutorRaw.Telefono || '',
            email: tutorRaw.email || tutorRaw.Email || '',
            parentesco: tutorRaw.parentesco || tutorRaw.Parentesco || 'Padre'
          } : null,
          domicilio: data.domicilio || data.Domicilio || this.sinInformar,
          peso: data.peso || data.Peso || null,
          altura: data.altura || data.Altura || null,
          pieHabil: data.pieHabil || data.PieHabil || null,
          fichaMedica: data.fichaMedica || data.FichaMedica || null,
          partidos: (data.partidos || data.Partidos || []).map((p: any) => ({
            idPartido: p.idPartido || p.IdPartido || 0,
            idCategoria: p.idCategoria || p.IdCategoria || 0,
            categoria: (p.categoria || p.Categoria || '').trim() || 'Sin categoría',
            fecha: p.fecha || p.Fecha,
            rival: p.rival || p.Rival || '',
            condicion: p.condicion || p.Condicion || 'Local',
            resultado: (p.resultado || p.Resultado || '').trim(),
            minutos: p.minutos || p.Minutos || 0
          }))
        };
        this.cargando = false;
      },
      error: (error: unknown) => {
        this.jugador = null;
        this.cargando = false;
        this.noEncontrado = error instanceof HttpErrorResponse && error.status === 404;
        if (!this.noEncontrado) {
          this.errorCarga = 'No se pudo cargar la ficha. Verificá que la API esté en ejecución.';
        }
      }
    });
  }

  getCategoriasAsignadas(): string[] {
    if (!this.jugador || !this.jugador.categoria || this.jugador.categoria === '-') return [];
    return this.jugador.categoria.split(',').map(c => c.trim()).filter(c => c.length > 0 && c !== 'Sin categoría');
  }

  getCategoriasPartidos(): string[] {
    if (!this.jugador) return [];
    const cats = new Set<string>();

    this.getCategoriasAsignadas().forEach(c => cats.add(c));

    if (this.jugador.partidos) {
      this.jugador.partidos.forEach(p => {
        if (p.categoria && p.categoria !== 'Sin categoría') {
          cats.add(p.categoria.trim());
        }
      });
    }

    return Array.from(cats);
  }

  get partidosFiltrados(): PartidoFichaItem[] {
    if (!this.jugador?.partidos) return [];
    if (!this.categoriaFiltroPartido) return this.jugador.partidos;
    return this.jugador.partidos.filter(p =>
      p.categoria.toLowerCase() === this.categoriaFiltroPartido.toLowerCase()
    );
  }

  get statsPartidos() {
    let ganados = 0;
    let empatados = 0;
    let perdidos = 0;
    const lista = this.partidosFiltrados;
    lista.forEach(p => {
      const r = (p.resultado || '').toUpperCase();
      if (r.startsWith('G')) ganados++;
      else if (r.startsWith('E')) empatados++;
      else if (r.startsWith('P')) perdidos++;
    });
    return { ganados, empatados, perdidos, total: lista.length };
  }

  get totalMinutosJugados(): string | number {
    if (!this.partidosFiltrados || this.partidosFiltrados.length === 0) {
      return this.sinInformar;
    }
    return this.partidosFiltrados.reduce((acc, curr) => acc + curr.minutos, 0);
  }

  get nombreCompleto(): string {
    return this.jugador ? `${this.jugador.nombre} ${this.jugador.apellido}` : this.sinInformar;
  }

  get fechaNacimiento(): string {
    if (!this.jugador || !this.jugador.fechaNacimiento) return this.sinInformar;
    const [anio, mes, dia] = this.jugador.fechaNacimiento.split('-');
    return anio && mes && dia ? `${dia}/${mes}/${anio}` : this.sinInformar;
  }

  get edad(): string {
    if (!this.jugador || !this.jugador.fechaNacimiento) return this.sinInformar;
    const [anio, mes, dia] = this.jugador.fechaNacimiento.split('-').map(Number);
    if (!anio || !mes || !dia) return this.sinInformar;

    const hoy = new Date();
    let edad = hoy.getFullYear() - anio;
    if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)) {
      edad--;
    }
    return edad >= 0 ? `${edad} años` : this.sinInformar;
  }

  get tutor(): string {
    return this.jugador?.tutor && (this.jugador.tutor.nombre || this.jugador.tutor.apellido)
      ? `${this.jugador.tutor.nombre} ${this.jugador.tutor.apellido}`.trim()
      : this.sinInformar;
  }

  get lesionesList(): string[] {
    if (!this.jugador?.fichaMedica?.historialLesiones) return [];
    return this.jugador.fichaMedica.historialLesiones
      .split('.')
      .map(l => l.trim())
      .filter(l => l.length > 0);
  }

  esResultado(resultado: string | undefined | null, letra: string): boolean {
    return !!resultado && resultado.trim().toUpperCase().startsWith(letra);
  }

  toggleMenuUsuario(event: MouseEvent): void {
    event.stopPropagation();
    this.menuUsuarioAbierto = !this.menuUsuarioAbierto;
  }

  toggleSidebar(): void {
    this.sidebarOculto = !this.sidebarOculto;
  }

  @HostListener('document:click')
  cerrarMenus(): void {
    this.menuUsuarioAbierto = false;
  }

  irASeleccionPortales(): void {
    this.router.navigate(['/seleccion-portales']);
  }

  irAConfiguracion(): void {
    alert('Módulo de configuración de cuenta en desarrollo.');
  }

  selectNav(label: string): void {
    this.navItems.forEach(item => item.active = (item.label === label));
    this.activeTab = label;
    if (label === 'Inicio') this.router.navigate(['/admin']);
    else if (label === 'Jugadores') this.router.navigate(['/admin/lista-jugadores']);
    else if (label === 'Categorias' || label === 'Categorías') this.router.navigate(['/admin/categorias']);
    else if (label === 'Staff') this.router.navigate(['/admin/staff']);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  volver(): void {
    this.router.navigate(['/admin/lista-jugadores']);
  }

  editarPerfil(): void {
    if (this.jugador) {
      this.router.navigate(['/admin/editar-perfil', this.jugador.id]);
    }
  }

  generarCredencial(): void {
    if (this.jugador) {
      this.mostrarPopupCredencial = true;
    }
  }

  descargarCredencial(): void {
    alert(`Descargando credencial oficial de ${this.nombreCompleto}...`);
  }
}
