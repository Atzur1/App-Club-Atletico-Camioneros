import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PortalAccessService } from '../../shared/auth/portal-access.service';
import { PlayerSummary } from '../../shared/models/portal.models';
import { ClubPortalApiService } from '../../shared/services/club-portal-api.service';

@Component({
  selector: 'app-shared-player-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './shared-player-list.component.html',
  styleUrl: './shared-player-list.component.css',
})
export class SharedPlayerListComponent implements OnInit {
  private readonly api = inject(ClubPortalApiService);
  private readonly access = inject(PortalAccessService);
  private readonly router = inject(Router);

  readonly role = this.access.role;
  readonly capabilities = this.access.capabilities;
  players: PlayerSummary[] = [];
  searchTerm = '';
  loading = true;
  error = '';

  ngOnInit(): void {
    this.api.listPlayers().subscribe({
      next: (players) => {
        this.players = this.access.visiblePlayers(players);
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar la lista de jugadores.';
        this.loading = false;
      },
    });
  }

  get filteredPlayers(): PlayerSummary[] {
    const term = this.searchTerm.trim().toLocaleLowerCase('es');
    if (!term) return this.players;
    return this.players.filter((player) =>
      `${player.nombre} ${player.apellido} ${player.dni} ${player.nombreCategoria ?? ''}`
        .toLocaleLowerCase('es')
        .includes(term),
    );
  }

  openProfile(id: number): void {
    this.router.navigate([`/${this.role}/jugadores`, id]);
  }
}

