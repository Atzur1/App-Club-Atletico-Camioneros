import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ClubPortalApiService } from '../../shared/services/club-portal-api.service';
import { AuthService } from '../../shared/services/auth.service';

interface MatchRecord {
  day: string;
  date: string;
  rival: string;
  result: string;
  minutes: string;
}

interface PlayerProfile {
  name: string;
  position: string;
  birthdate: string;
  age: string;
  weight: string;
  height: string;
  preferredFoot: string;
  bloodType: string;
  tutor: string;
  phone: string;
  address: string;
  pathologies: string;
  lesions: string;
  medicalNotes: string;
}

@Component({
  selector: 'app-coordinador-visualizar-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './coordinador-visualizar-perfil.html',
  styleUrl: './coordinador-visualizar-perfil.css'
})
export class CoordinadorVisualizarPerfil implements OnInit {
  
  userName = 'Rubén del Olmo';
  userEmail = 'Ejemplo@mailejemplo.com';

  // Base de datos simulada para mapear los perfiles según el jugador seleccionado
  playersDatabase: { [key: string]: PlayerProfile } = {
    'JUAN PÉREZ': {
      name: 'JUAN PÉREZ',
      position: 'ARQUERO',
      birthdate: '15/05/2009',
      age: '17 Años',
      weight: '68 Kg',
      height: '1.78 m',
      preferredFoot: 'Derecho',
      bloodType: 'O +',
      tutor: 'Carlos Pérez',
      phone: '3512345678',
      address: 'Calle Falsa 123',
      pathologies: 'Sin patologías conocidas.',
      lesions: '• Esguince de tobillo (2025)\n• Sobrecarga muscular (2026)',
      medicalNotes: 'Apto médico físico y cardiológico al día.'
    },
    'JUAN PADELA': {
      name: 'JUAN PADELA',
      position: 'DEFENSOR',
      birthdate: '22/08/2006',
      age: '19 Años',
      weight: '74 Kg',
      height: '1.82 m',
      preferredFoot: 'Izquierdo',
      bloodType: 'A +',
      tutor: 'Mario Padela',
      phone: '3519876543',
      address: 'Av. Sabattini 4500',
      pathologies: 'Asma leve controlada.',
      lesions: '• Contractura en cuádriceps (2025)',
      medicalNotes: 'Uso de inhalador previo a exigencia física alta.'
    },
    'LAURA GONZÁLEZ': {
      name: 'LAURA GONZÁLEZ',
      position: 'VOLANTE',
      birthdate: '10/11/2012',
      age: '14 Años',
      weight: '55 Kg',
      height: '1.62 m',
      preferredFoot: 'Derecho',
      bloodType: 'B +',
      tutor: 'Sofía González',
      phone: '3515554433',
      address: 'San Jerónimo 850',
      pathologies: 'Ninguna.',
      lesions: '• Sin lesiones registradas.',
      medicalNotes: 'Apto médico escolar y deportivo vigente.'
    },
    'PEDRO SÁNCHEZ': {
      name: 'PEDRO SÁNCHEZ',
      position: 'DELANTERO',
      birthdate: '03/02/2010',
      age: '16 Años',
      weight: '65 Kg',
      height: '1.75 m',
      preferredFoot: 'Derecho',
      bloodType: '0 -',
      tutor: 'Esteban Sánchez',
      phone: '3513332211',
      address: 'Rincón 332',
      pathologies: 'Ninguna.',
      lesions: '• Rotura fibrilar isquiotibial (2025)',
      medicalNotes: 'Rehabilitación completa finalizada exitosamente.'
    }
  };

  player: PlayerProfile = this.playersDatabase['JUAN PÉREZ'];

  // Historial de partidos (copiado de admin-ficha-jugador: 20 registros)
  matches: MatchRecord[] = Array.from({ length: 20 }, (_, i) => ({
    day: 'DD/MM',
    date: `${i + 1}`,
    rival: 'NOMBRE RIVAL',
    result: '0 - 0',
    minutes: "00'"
  }));

  totalMinutes = "00'";

  activeTab = 'Jugadores';
  navItems = [
    { label: 'Inicio', icon: 'home', active: false, route: '/coordinador' },
    { label: 'Jugadores', icon: 'group', active: true, route: '/coordinador/jugadores' },
    { label: 'Categorias', icon: 'category', active: false, route: '/coordinador/categorias' }
  ];

  constructor(private router: Router, private route: ActivatedRoute) {}

  private readonly api = inject(ClubPortalApiService);
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    const user = this.auth.obtenerDatosUsuario();
    this.userEmail = user.email;
    this.userName = user.email.split('@')[0];
    this.api.getPlayer(id).subscribe(player => this.player = {
      name: (player.nombreCompleto || `${player.nombre} ${player.apellido}`).toUpperCase(),
      position: player.posicionCancha || 'SIN POSICIÓN',
      birthdate: player.fechaDeNacimiento || player.fechaNacimiento || 'Sin informar',
      age: 'Sin informar',
      weight: player.peso == null ? 'Sin informar' : `${player.peso} Kg`,
      height: player.altura == null ? 'Sin informar' : `${player.altura} m`,
      preferredFoot: player.pieHabil || 'Sin informar',
      bloodType: player.fichaMedica?.grupoSanguineo || 'Sin informar',
      tutor: 'Sin informar', phone: 'Sin informar', address: player.domicilio || 'Sin informar',
      pathologies: player.fichaMedica?.patologias || 'Sin patologías informadas.',
      lesions: player.fichaMedica?.historialLesiones || 'Sin lesiones registradas.',
      medicalNotes: player.fichaMedica?.observaciones || 'Sin observaciones médicas.',
    });
  }

  selectNav(item: any) {
    this.navItems.forEach(n => n.active = (n.label === item.label));
    this.activeTab = item.label;
    if (item.route && item.route !== '#') {
      this.router.navigate([item.route]);
    }
  }

  getLesionsList(lesionsStr: string): string[] {
    if (!lesionsStr) return [];
    return lesionsStr.split('\n').map(l => l.replace(/^[•\-\s]+/, '').trim()).filter(l => l.length > 0);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
