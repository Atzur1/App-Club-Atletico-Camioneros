import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RolePlayerViewService } from '../../shared/services/role-player-view.service';

export interface CategoriaItem {
  id: number;
  nombre: string;
  cantidadJugadores: string;
  asociacion: string;
}

@Component({
  selector: 'app-medico-seleccion-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './medico-seleccion-categorias.component.html',
  styleUrl: './medico-seleccion-categorias.component.css'
})
export class MedicoSeleccionCategoriasComponent implements OnInit {
  constructor(private router: Router, private views: RolePlayerViewService) {}

  searchTerm = '';
  asociacionFiltro = '';
  ordenFiltro = '';

  categorias: CategoriaItem[] = [];
  ngOnInit(): void { this.views.categories().subscribe(categories => this.categorias = categories); }

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

  verCategoria(id: number) {
    this.router.navigate(['/medico/categorias', id]);
  }
}
