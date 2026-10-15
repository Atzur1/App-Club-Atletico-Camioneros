import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RolePlayerViewService } from '../../shared/services/role-player-view.service';

export interface CategoriaDT {
  id: number;
  nombre: string;
  cantidadJugadores: string;
  asociacion: string;
}

@Component({
  selector: 'app-dt-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dt-categoria.component.html',
  styleUrl: './dt-categoria.component.css'
})
export class DtCategoriaComponent implements OnInit {
  constructor(private router: Router, private views: RolePlayerViewService) {}

  searchTerm = '';
  asociacionFiltro = '';
  ordenFiltro = '';


  categorias: CategoriaDT[] = [];
  ngOnInit(): void { this.views.categories(true).subscribe(categories => this.categorias = categories); }

  get filteredCategorias(): CategoriaDT[] {
    let result = this.categorias.filter(c => {
      const matchSearch = !this.searchTerm ||
        c.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchAso = !this.asociacionFiltro || c.asociacion === this.asociacionFiltro;
      return matchSearch && matchAso;
    });

    if (this.ordenFiltro === 'nombre') {
      result.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    return result;
  }

  verCategoria(id: number) {
    this.router.navigate(['/dt/categorias', id]);
  }

}
