import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClubPortalApiService } from '../../shared/services/club-portal-api.service';
import { AuthService } from '../../shared/services/auth.service';

export interface CategoriaItem {
  id: number;
  nombre: string;
  cantidadJugadores: string;
  asociacion: string;
}

@Component({
  selector: 'app-coordinador-seleccion-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './coordinador-seleccion-categorias.html',
  styleUrl: './coordinador-seleccion-categorias.css'
})
export class CoordinadorSeleccionCategorias implements OnInit {
  
  userName = 'Rubén del Olmo';
  userEmail = 'Ejemplo@mailejemplo.com';

  searchTerm = '';
  asociacionFiltro = '';
  ordenFiltro = '';

  activeTab = 'Jugadores';

  navItems = [
    { label: 'Inicio', icon: 'home', active: false, route: '/coordinador' },
    { label: 'Jugadores', icon: 'group', active: false, route: '/coordinador/jugadores' },
    { label: 'Categorias', icon: 'category', active: true, route: '/coordinador/categorias' }
  ];

  categorias: CategoriaItem[] = [];
  private readonly api = inject(ClubPortalApiService);
  private readonly auth = inject(AuthService);

  constructor(private router: Router) {}

  ngOnInit(): void {
    const user = this.auth.obtenerDatosUsuario();
    this.userEmail = user.email;
    this.userName = user.email.split('@')[0];
    this.api.listCategories().subscribe(categories => this.categorias = categories.map(category => ({
      id: category.idCategoria,
      nombre: category.nombreCategoria,
      cantidadJugadores: `${category.cantidadJugadores ?? 0} JUGADORES`,
      asociacion: category.asociacion || 'Sin asociación',
    })));
  }

  get filteredCategorias(): CategoriaItem[] {
    return this.categorias
      .filter(c => {
        const term = this.searchTerm.trim().toLowerCase();
        const matchSearch = !term || c.nombre.toLowerCase().includes(term);
        const matchAso = !this.asociacionFiltro || c.asociacion === this.asociacionFiltro;
        return matchSearch && matchAso;
      })
      .sort((a, b) => {
        if (this.ordenFiltro === 'nombre') return a.nombre.localeCompare(b.nombre);
        return 0;
      });
  }

  selectNav(item: any) {
    this.navItems.forEach(n => n.active = (n.label === item.label));
    this.activeTab = item.label;
    if (item.route && item.route !== '#') {
      this.router.navigate([item.route]);
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  onViewCategory(categoryName: string): void {
    this.router.navigate(['/coordinador/categorias']);
  }

  verCategoria(id: number): void {
    this.router.navigate(['/coordinador/categorias', id]);
  }
}

