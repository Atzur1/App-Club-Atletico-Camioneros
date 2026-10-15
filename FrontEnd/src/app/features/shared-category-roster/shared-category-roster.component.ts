import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PortalAccessService } from '../../shared/auth/portal-access.service';
import { CategorySummary, RosterPlayer } from '../../shared/models/portal.models';
import { ClubPortalApiService } from '../../shared/services/club-portal-api.service';

@Component({
  selector: 'app-shared-category-roster',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './shared-category-roster.component.html',
  styleUrl: './shared-category-roster.component.css',
})
export class SharedCategoryRosterComponent implements OnInit {
  private readonly api = inject(ClubPortalApiService);
  private readonly access = inject(PortalAccessService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly role = this.access.role;
  readonly capabilities = this.access.capabilities;
  category: CategorySummary | null = null;
  players: RosterPlayer[] = [];
  availablePlayers: RosterPlayer[] = [];
  selectedPlayerId: number | null = null;
  searchTerm = '';
  loading = true;
  error = '';
  private categoryId = 0;

  ngOnInit(): void {
    this.categoryId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(this.categoryId) || this.categoryId <= 0) {
      this.error = 'La categoría solicitada no es válida.';
      this.loading = false;
      return;
    }
    this.loadCategory();
  }

  get filteredPlayers(): RosterPlayer[] {
    const term = this.searchTerm.trim().toLocaleLowerCase('es');
    return !term ? this.players : this.players.filter((player) =>
      `${player.nombreCompleto} ${player.dni} ${player.posicionCancha ?? ''}`.toLocaleLowerCase('es').includes(term),
    );
  }

  openProfile(id: number): void { this.router.navigate([`/${this.role}/jugadores`, id]); }

  addPlayer(): void {
    if (!this.capabilities.canManageCategoryRoster || !this.selectedPlayerId) return;
    this.api.addPlayerToCategory(this.categoryId, this.selectedPlayerId).subscribe({
      next: () => { this.selectedPlayerId = null; this.loadRoster(); this.loadAvailablePlayers(); },
      error: () => this.error = 'No se pudo agregar el jugador a la categoría.',
    });
  }

  removePlayer(id: number): void {
    if (!this.capabilities.canManageCategoryRoster || !confirm('¿Desea quitar al jugador de esta categoría?')) return;
    this.api.removePlayerFromCategory(this.categoryId, id).subscribe({
      next: () => { this.loadRoster(); this.loadAvailablePlayers(); },
      error: () => this.error = 'No se pudo quitar el jugador de la categoría.',
    });
  }

  private loadCategory(): void {
    this.api.getCategory(this.categoryId).subscribe({
      next: (category) => {
        if (!this.access.categoryIsVisible(category)) {
          this.router.navigate(['/acceso-denegado']);
          return;
        }
        this.category = category;
        this.loadRoster();
        if (this.capabilities.canManageCategoryRoster) this.loadAvailablePlayers();
      },
      error: () => {
        this.error = 'No se pudo cargar la categoría.';
        this.loading = false;
      },
    });
  }

  private loadRoster(): void {
    this.loading = true;
    this.api.listRoster(this.categoryId).subscribe({
      next: (players) => { this.players = players; this.loading = false; },
      error: () => { this.error = 'No se pudo cargar el plantel.'; this.loading = false; },
    });
  }

  private loadAvailablePlayers(): void {
    this.api.listAvailablePlayers(this.categoryId).subscribe({
      next: (players) => this.availablePlayers = players,
      error: () => this.availablePlayers = [],
    });
  }

}

