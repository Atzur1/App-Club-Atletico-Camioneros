import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-registro-personas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-registro-personas.component.html',
  styleUrl: './admin-registro-personas.component.css'
})
export class AdminRegistroPersonasComponent {
  private router = inject(Router);

  navegar(tipo: 'jugador' | 'staff') {
    if (tipo === 'jugador') {
      this.router.navigate(['/admin/jugadores/nuevo']);
    } else if (tipo === 'staff') {
      this.router.navigate(['/admin/staff/nuevo']);
    }
  }

  volver() {
    // Redirige correctamente a la pantalla de los tres portales
    this.router.navigate(['/admin/portales']);
  }
  
}
