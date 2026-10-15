import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ClubPortalApiService } from '../../shared/services/club-portal-api.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-coordinador-visualizar-plantel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './coordinador-visualizar-plantel.html',
  styleUrl: './coordinador-visualizar-plantel.css'
})
export class CoordinadorVisualizarPlantel implements OnInit {
  userName = 'Rubén del Olmo';
  userEmail = 'Ejemplo@mailejemplo.com';
  categoryName = 'CATEGORÍA 2009';
  activeTab = 'Jugadores';

  navItems = [
    { label: 'Inicio', icon: 'home', active: false, route: '/coordinador' },
    { label: 'Jugadores', icon: 'group', active: true, route: '/coordinador/jugadores' },
    { label: 'Categorias', icon: 'category', active: false, route: '/coordinador/categorias' }
  ];

  selectedPosition = '';
  searchTerm = '';

  players: Array<{ id: number; name: string; dni: string; position: string; age: string }> = [];
  private readonly api = inject(ClubPortalApiService);
  private readonly auth = inject(AuthService);

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const categoryId = Number(this.route.snapshot.paramMap.get('id'));
    if (!categoryId) return;
    this.api.getCategory(categoryId).subscribe(category => this.categoryName = category.nombreCategoria);
    this.api.listRoster(categoryId).subscribe(players => this.players = players.map(player => ({
      id: player.idJugador, name: player.nombreCompleto, dni: player.dni,
      position: player.posicionCancha || 'SIN POSICIÓN', age: this.ageLabel(player.fechaNacimiento),
    })));
  }

  get filteredPlayers() {
    return this.players.filter(p => {
      const matchPos = !this.selectedPosition || p.position === this.selectedPosition;
      const matchSearch = !this.searchTerm || p.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchPos && matchSearch;
    });
  }

  filterByPosition(pos: string) {
    this.selectedPosition = this.selectedPosition === pos ? '' : pos;
  }

  verFicha(name: string) {
    const player = this.players.find(candidate => candidate.name === name);
    if (player) this.router.navigate(['/coordinador/jugadores', player.id]);
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

  private ageLabel(value?: string | null): string {
    if (!value) return 'SIN EDAD';
    const birth = new Date(value);
    return `${new Date().getFullYear() - birth.getFullYear()} años`;
  }
}

