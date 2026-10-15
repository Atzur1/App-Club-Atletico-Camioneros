import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-route-status',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="status-page">
      <section>
        <p class="code">{{ code() }}</p>
        <h1>{{ title() }}</h1>
        <p>{{ message() }}</p>
        <a routerLink="/">Volver al inicio</a>
      </section>
    </main>
  `,
  styles: `
    .status-page { min-height: 100dvh; display: grid; place-items: center; padding: 2rem; font-family: sans-serif; background: #f5f7fa; color: #1f2937; }
    section { max-width: 34rem; text-align: center; }
    .code { margin: 0; color: #b91c1c; font-size: 1.25rem; font-weight: 700; }
    h1 { margin: .5rem 0; font-size: clamp(2rem, 6vw, 3.5rem); }
    a { display: inline-block; margin-top: 1rem; padding: .75rem 1rem; border-radius: .5rem; background: #111827; color: white; text-decoration: none; }
  `,
})
export class RouteStatusComponent {
  private readonly data = inject(ActivatedRoute).snapshot.data;
  readonly code = () => this.data['code'] ?? '404';
  readonly title = () => this.data['title'] ?? 'Página no encontrada';
  readonly message = () => this.data['message'] ?? 'La dirección solicitada no existe.';
}
