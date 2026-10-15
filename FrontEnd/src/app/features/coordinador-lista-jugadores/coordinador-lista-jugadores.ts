import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClubPortalApiService } from '../../shared/services/club-portal-api.service';
import { AuthService } from '../../shared/services/auth.service';

export interface Player {
  id: number;
  nombreCompleto: string;
  dni: string;
  posicion: 'ARQUERO' | 'DEFENSOR' | 'VOLANTE' | 'DELANTERO';
  edad: string;
  categoria: string;
}

@Component({
  selector: 'app-coordinador-lista-jugadores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './coordinador-lista-jugadores.html',
  styleUrl: './coordinador-lista-jugadores.css'
})
export class CoordinadorListaJugadores implements OnInit {
  userName = 'Rubén del Olmo';
  userEmail = 'Ejemplo@mailejemplo.com';

  searchTerm = '';
  posicionFiltro = ''; // '' | 'ARQUERO' | 'DEFENSOR' | 'VOLANTE' | 'DELANTERO'

  activeTab = 'Jugadores';

  navItems = [
    { label: 'Inicio', icon: 'home', active: false, route: '/coordinador' },
    { label: 'Jugadores', icon: 'group', active: true, route: '/coordinador/jugadores' },
    { label: 'Categorias', icon: 'category', active: false, route: '/coordinador/categorias' }
  ];

  players: Player[] = [];
  private readonly api = inject(ClubPortalApiService);
  private readonly auth = inject(AuthService);

  constructor(private router: Router) {}

  ngOnInit(): void {
    const user = this.auth.obtenerDatosUsuario();
    this.userEmail = user.email;
    this.userName = user.email.split('@')[0];
    this.api.listPlayers().subscribe(players => this.players = players.map(player => ({
      id: player.idJugador,
      nombreCompleto: player.nombreCompleto || `${player.nombre} ${player.apellido}`,
      dni: player.dni,
      posicion: (player.posicionCancha || 'VOLANTE') as Player['posicion'],
      edad: this.ageLabel(player.fechaNacimiento),
      categoria: player.nombreCategoria || 'SIN CATEGORÍA',
    })));
  }

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

  selectNav(item: any) {
    this.navItems.forEach(n => n.active = (n.label === item.label));
    this.activeTab = item.label;
    if (item.route && item.route !== '#') {
      this.router.navigate([item.route]);
    }
  }

  verFicha(player: Player) {
    this.router.navigate(['/coordinador/jugadores', player.id]);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private ageLabel(value?: string | null): string {
    if (!value) return 'SIN EDAD';
    const birth = new Date(value);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age--;
    return `${age} Años`;
  }
}

