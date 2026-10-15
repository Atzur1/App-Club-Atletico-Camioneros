import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PortalAccessService } from '../../shared/auth/portal-access.service';
import { PlayerProfile } from '../../shared/models/portal.models';
import { ClubPortalApiService } from '../../shared/services/club-portal-api.service';

@Component({
  selector: 'app-shared-player-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shared-player-profile.component.html',
  styleUrl: './shared-player-profile.component.css',
})
export class SharedPlayerProfileComponent implements OnInit {
  private readonly api = inject(ClubPortalApiService);
  private readonly access = inject(PortalAccessService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly role = this.access.role;
  readonly capabilities = this.access.capabilities;
  player: PlayerProfile | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.error = 'El jugador solicitado no es válido.';
      this.loading = false;
      return;
    }

    this.api.getPlayer(id).subscribe({
      next: (player) => {
        if (!this.access.playerIsVisible(player)) {
          this.router.navigate(['/acceso-denegado']);
          return;
        }
        this.player = player;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el perfil del jugador.';
        this.loading = false;
      },
    });
  }

  openMedicalRecord(): void {
    if (this.player) this.router.navigate([`/${this.role}/jugadores`, this.player.idJugador, 'ficha-medica']);
  }

  editPlayer(): void {
    if (this.player && this.capabilities.canEditPlayers) {
      this.router.navigate(['/admin/jugadores', this.player.idJugador, 'editar']);
    }
  }
}

