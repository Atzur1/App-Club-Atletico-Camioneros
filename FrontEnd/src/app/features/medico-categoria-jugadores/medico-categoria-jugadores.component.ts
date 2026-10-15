import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RolePlayerViewService } from '../../shared/services/role-player-view.service';

export interface Player {
  id: number;
  nombreCompleto: string;
  dni: string;
  posicion: 'ARQUERO' | 'DEFENSOR' | 'VOLANTE' | 'DELANTERO';
  edad: string;
}

@Component({
  selector: 'app-medico-categoria-jugadores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './medico-categoria-jugadores.component.html',
  styleUrl: './medico-categoria-jugadores.component.css'
})
export class MedicoCategoriaJugadoresComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute, private views: RolePlayerViewService) {}

  searchTerm = '';
  posicionFiltro = '';

  players: Player[] = [];
  ngOnInit(): void { const id = Number(this.route.snapshot.paramMap.get('id')); this.views.categoryPlayers(id).subscribe(players => this.players = players as Player[]); }

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
