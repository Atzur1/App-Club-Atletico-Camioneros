import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RolePlayerViewService } from '../../shared/services/role-player-view.service';

export interface Player {
  id: number;
  nombreCompleto: string;
  dni: string;
  posicion: 'ARQUERO' | 'DEFENSOR' | 'VOLANTE' | 'DELANTERO';
  edad: string;
}

@Component({
  selector: 'app-medico-lista-jugadores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './medico-lista-jugadores.component.html',
  styleUrl: './medico-lista-jugadores.component.css'
})
export class MedicoListaJugadoresComponent implements OnInit {
  constructor(private router: Router, private views: RolePlayerViewService) {}

  searchTerm = '';
  posicionFiltro = '';

  players: Player[] = [];
  ngOnInit(): void { this.views.players().subscribe(players => this.players = players as Player[]); }

  togglePosicion(pos: string) {
    if (this.posicionFiltro === pos) {
      this.posicionFiltro = '';
    } else {
      this.posicionFiltro = pos;
    }
  }

  get filteredPlayers(): Player[] {
    return this.players.filter(p => {
      const term = this.searchTerm.trim().toLowerCase();
      const matchSearch = !term || p.nombreCompleto.toLowerCase().includes(term) || p.dni.includes(term);
      const matchPos = !this.posicionFiltro || p.posicion === this.posicionFiltro;
      return matchSearch && matchPos;
    });
  }

  verFicha(id: number) {
    this.router.navigate(['/medico/jugadores', id]);
  }
}
