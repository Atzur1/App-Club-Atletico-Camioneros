import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JugadorService } from '../../shared/services/jugador.service';
import { AuthService } from '../../shared/services/auth.service';

export interface CategoriaSelectOption {
  id: number;
  nombre: string;
  asociacion: string;
}

export interface PartidoEdicionItem {
  idPartido: number;
  idCategoria: number;
  categoria: string;
  fecha: string;
  rival: string;
  condicion: string;
  resultado: string;
  minutos: number;
}

@Component({
  selector: 'app-admin-editar-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-editar-perfil.html',
  styleUrl: './admin-editar-perfil.css'
})
export class AdminEditarPerfil implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly jugadorService = inject(JugadorService);
  private readonly authService = inject(AuthService);

  jugadorId = '';
  cargando = true;
  guardando = false;
  errorCarga = '';

  // Control del modal flotante del tutor
  modalTutorAbierto = false;

  usuarioActual = {
    nombre: 'Cargando...',
    email: ''
  };

  menuUsuarioAbierto = false;
  sidebarOculto = false;
  activeTab = 'Jugadores';

  navItems = [
    { label: 'Inicio', icon: 'home', active: false },
    { label: 'Jugadores', icon: 'group', active: true },
    { label: 'Staff', icon: 'badge', active: false },
    { label: 'Categorias', icon: 'category', active: false }
  ];

  perfil: any = {};
  categoriasList: CategoriaSelectOption[] = [];
  categoriaFiltroPartido: string = '';

  lesiones: string[] = [];
  nuevaLesion = '';
  usarFechaHoy = true;

  buscandoTutor = false;
  tutorEncontradoMensaje = '';

  posiciones = ['Arquero', 'Defensor', 'Mediocampista', 'Delantero'];
  pies = ['Derecho', 'Izquierdo', 'Ambidiestro'];
  gruposSanguineos = ['0+', '0-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  parentescos = ['Padre', 'Madre', 'Tutor Legal', 'Tío/a', 'Abuelo/a', 'Hermano/a', 'Otro'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.volver();
      return;
    }
    this.jugadorId = id;
    this.cargarUsuario();
    this.cargarCategorias();
    this.cargarDatos();
  }

  abrirModalTutor(): void {
    this.modalTutorAbierto = true;
  }

  cerrarModalTutor(): void {
    this.modalTutorAbierto = false;
  }

  limpiarNombreRol(rol: string): string {
    if (!rol) return '';
    let r = rol.replace(/\s*\([^)]*\)/gi, '').trim();
    if (r.toLowerCase() === 'tesorero') r = 'Administrador';
    return r;
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
        this.usuarioActual = { nombre: this.limpiarNombreRol(rol), email: email };
      } catch {
        this.usuarioActual = { nombre: this.limpiarNombreRol(rol), email: '' };
      }
    }
  }

  cargarCategorias(): void {
    this.http.get<any[]>('http://localhost:5191/api/categorias').subscribe({
      next: (data) => {
        this.categoriasList = data.map(c => ({
          id: c.idCategoria || c.PK_id_categoria || c.pk_id_categoria || c.id,
          nombre: c.nombreCategoria || c.nombre_categoria || c.nombre,
          asociacion: c.asociacion || ((c.nombreCategoria || '').toUpperCase().includes('AFA') ? 'AFA' : 'Liga Cordobesa')
        }));
      },
      error: () => this.categoriasList = []
    });
  }

  formatearPosicion(pos?: string): string {
    if (!pos) return 'Delantero';
    const p = pos.trim().toUpperCase();
    if (p.includes('ARQUER')) return 'Arquero';
    if (p.includes('DEFENS')) return 'Defensor';
    if (p.includes('MEDIO') || p.includes('VOLANTE')) return 'Mediocampista';
    if (p.includes('DELANT')) return 'Delantero';
    return pos.trim();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.jugadorService.obtenerPorId(this.jugadorId).subscribe({
      next: (data: any) => {
        const fechaRaw = data.fechaDeNacimiento || data.FechaDeNacimiento || '';
        const fechaCorta = fechaRaw ? fechaRaw.split('T')[0] : '';
        const tutorRaw = data.tutor || data.Tutor;

        this.perfil = {
          id: data.idJugador || data.IdJugador,
          nombre: data.nombre || data.Nombre,
          apellido: data.apellido || data.Apellido,
          dni: data.dni || data.Dni,
          genero: data.genero || data.Genero || 'Masculino',
          fechaNacimiento: fechaCorta,
          posicion: this.formatearPosicion(data.posicionCancha || data.PosicionCancha),
          idCategoria: data.idCategoria || data.IdCategoria || 0,
          categoria: data.nombreCategoria || data.NombreCategoria || '',
          clubOrigen: data.clubOrigen || data.ClubOrigen || '',
          peso: data.peso || data.Peso,
          altura: data.altura || data.Altura,
          pieHabil: data.pieHabil || data.PieHabil || 'Derecho',
          domicilio: data.domicilio || data.Domicilio || '',
          tutor: tutorRaw ? {
            dni: tutorRaw.dni || tutorRaw.Dni || '',
            nombre: tutorRaw.nombre || tutorRaw.Nombre || '',
            apellido: tutorRaw.apellido || tutorRaw.Apellido || '',
            telefono: tutorRaw.telefono || tutorRaw.Telefono || '',
            email: tutorRaw.email || tutorRaw.Email || '',
            parentesco: tutorRaw.parentesco || tutorRaw.Parentesco || 'Padre'
          } : { dni: '', nombre: '', apellido: '', telefono: '', email: '', parentesco: 'Padre' },
          fichaMedica: data.fichaMedica || data.FichaMedica || { patologias: '', historialLesiones: '', observaciones: '', grupoSanguineo: '0+' },
          partidos: (data.partidos || data.Partidos || []).map((p: any) => ({
            idPartido: p.idPartido || p.IdPartido || 0,
            idCategoria: p.idCategoria || p.IdCategoria || 0,
            categoria: (p.categoria || p.Categoria || '').trim() || 'Sin categoría',
            fecha: p.fecha || p.Fecha,
            rival: p.rival || p.Rival || '',
            condicion: p.condicion || p.Condicion || 'Local',
            resultado: (p.resultado || p.Resultado || '').trim(),
            minutos: p.minutos !== undefined ? p.minutos : (p.Minutos !== undefined ? p.Minutos : 0)
          }))
        };

        const historialString = this.perfil.fichaMedica.historialLesiones || '';
        this.lesiones = historialString
          .split('.')
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 0);

        this.cargando = false;
      },
      error: () => {
        this.errorCarga = 'Error al cargar los datos para edición.';
        this.cargando = false;
      }
    });
  }

  getCategoriasPartidos(): string[] {
    if (!this.perfil) return [];
    const cats = new Set<string>();

    if (this.perfil.categoria) {
      this.perfil.categoria.split(',').forEach((c: string) => {
        const cat = c.trim();
        if (cat.length > 0 && cat !== 'Sin categoría') cats.add(cat);
      });
    }

    if (this.perfil.partidos) {
      this.perfil.partidos.forEach((p: PartidoEdicionItem) => {
        if (p.categoria && p.categoria !== 'Sin categoría') {
          cats.add(p.categoria.trim());
        }
      });
    }

    return Array.from(cats);
  }

  get partidosFiltrados(): PartidoEdicionItem[] {
    if (!this.perfil?.partidos) return [];
    if (!this.categoriaFiltroPartido) return this.perfil.partidos;
    return this.perfil.partidos.filter((p: PartidoEdicionItem) =>
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

  get edadCalculada(): string {
    if (!this.perfil.fechaNacimiento) return '-';
    const [anio, mes, dia] = this.perfil.fechaNacimiento.split('-').map(Number);
    if (!anio) return '-';

    const hoy = new Date();
    let edad = hoy.getFullYear() - anio;
    if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)) {
      edad--;
    }
    return `${edad} años`;
  }

  esResultado(resultado: string | undefined | null, letra: string): boolean {
    return !!resultado && resultado.trim().toUpperCase().startsWith(letra);
  }

  buscarTutor(): void {
    const dni = (this.perfil.tutor?.dni || '').trim();
    if (!dni) {
      alert('Por favor ingrese el DNI del tutor para realizar la búsqueda.');
      return;
    }

    this.buscandoTutor = true;
    this.tutorEncontradoMensaje = '';

    this.http.get<any>(`http://localhost:5191/api/jugadores/tutores/${dni}`).subscribe({
      next: (data) => {
        this.buscandoTutor = false;
        this.perfil.tutor.nombre = data.nombre || '';
        this.perfil.tutor.apellido = data.apellido || '';
        this.perfil.tutor.telefono = data.telefono || '';
        this.perfil.tutor.email = data.email || '';
        if (data.parentesco) {
          this.perfil.tutor.parentesco = data.parentesco;
        }
        this.tutorEncontradoMensaje = `Tutor encontrado: ${data.nombre} ${data.apellido}. Datos autocompletados.`;
      },
      error: () => {
        this.buscandoTutor = false;
        this.tutorEncontradoMensaje = '';
        alert('No se encontró ningún tutor registrado con ese DNI. Podés cargar los datos manualmente.');
      }
    });
  }

  agregarLesion(): void {
    let textoFinal = this.nuevaLesion.trim();

    if (textoFinal) {
      if (this.usarFechaHoy && !textoFinal.includes('(')) {
        const hoy = new Date();
        const dia = String(hoy.getDate()).padStart(2, '0');
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const anio = hoy.getFullYear();
        textoFinal += ` (${dia}/${mes}/${anio})`;
      }

      this.lesiones.push(textoFinal);
      this.nuevaLesion = '';
      this.sincronizarLesionesSQL();
    }
  }

  eliminarLesion(index: number): void {
    this.lesiones.splice(index, 1);
    this.sincronizarLesionesSQL();
  }

  sincronizarLesionesSQL(): void {
    this.perfil.fichaMedica.historialLesiones = this.lesiones.join('. ') + (this.lesiones.length > 0 ? '.' : '');
  }

  guardar(): void {
    this.guardando = true;
    this.sincronizarLesionesSQL();

    this.jugadorService.actualizarPerfil(this.jugadorId, this.perfil).subscribe({
      next: () => {
        if (this.perfil.tutor && this.perfil.tutor.dni?.trim() && this.perfil.tutor.nombre?.trim() && this.perfil.tutor.telefono?.trim()) {
          this.http.put(`http://localhost:5191/api/jugadores/${this.jugadorId}/tutor`, this.perfil.tutor).subscribe({
            next: () => {
              this.guardando = false;
              alert('¡Perfil y datos del tutor actualizados exitosamente!');
              this.volver();
            },
            error: (err) => {
              this.guardando = false;
              alert('Perfil actualizado, pero ocurrió un error al guardar el tutor: ' + (err.error?.message || 'Error del servidor'));
              this.volver();
            }
          });
        } else {
          this.guardando = false;
          alert('¡Cambios guardados exitosamente en la base de datos!');
          this.volver();
        }
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error al guardar:', err);
        alert('Ocurrió un error al guardar los cambios en el servidor.');
      }
    });
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

  volver(): void {
    this.router.navigate(['/admin/ficha-jugador', this.jugadorId]);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
