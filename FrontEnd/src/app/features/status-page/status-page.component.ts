import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-status-page',
  standalone: true,
  imports: [RouterLink],
  template: `<main class="status"><h1>{{ title }}</h1><p>{{ message }}</p><a routerLink="/login">Volver al inicio</a></main>`,
  styles: [`.status{max-width:40rem;margin:15vh auto;padding:2rem;text-align:center;font-family:Arial,sans-serif}a{color:#007a3d;font-weight:700}`]
})
export class StatusPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.data['title'];
  readonly message = this.route.snapshot.data['message'];
}
