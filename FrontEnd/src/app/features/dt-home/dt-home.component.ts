import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { RolePlayerViewService } from '../../shared/services/role-player-view.service';

export interface PlayerDT {
  id: number;
  nombreCompleto: string;
  dni: string;
  categoria: string;
  fechaNacimiento: string;
  foto?: string;
}

@Component({
  selector: 'app-dt-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dt-home.component.html',
  styleUrl: './dt-home.component.css'
})
export class DtHomeComponent implements OnInit {
  constructor(private router: Router, private views: RolePlayerViewService) {}

  cantidadJugadores = 0;
  categoriaAsignada = 'Sin categorías asignadas';
  readonly estadoMedicoActual = 'Sin dato';

  searchTerm = '';
  filtroCategoria = '';
  ordenarPor = '';

  categoriasDisponibles: string[] = [];
  players: PlayerDT[] = [];

  ngOnInit(): void {
    forkJoin({ players: this.views.players(), categories: this.views.categories(true) }).subscribe(({ players, categories }) => {
      this.categoriasDisponibles = categories.map(category => category.nombre);
      this.categoriaAsignada = this.categoriasDisponibles.join(', ') || 'Sin categorías asignadas';
      this.players = players;
      this.cantidadJugadores = this.players.length;
    });
  }

  get filteredPlayers(): PlayerDT[] {
    let result = this.players.filter(p => {
      const matchSearch = !this.searchTerm ||
        p.nombreCompleto.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.dni.includes(this.searchTerm);

      const matchCat = !this.filtroCategoria || p.categoria === this.filtroCategoria;

      return matchSearch && matchCat;
    });

    if (this.ordenarPor === 'nombre') {
      result.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
    } else if (this.ordenarPor === 'dni') {
      result.sort((a, b) => a.dni.localeCompare(b.dni));
    }

    return result;
  }

  verFicha(player: PlayerDT) {
    this.router.navigate(['/dt/jugadores', player.id]);
  }

}

