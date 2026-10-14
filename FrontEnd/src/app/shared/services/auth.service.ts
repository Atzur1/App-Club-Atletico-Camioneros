import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Capability, RoleId, hasCapability } from '../../core/auth/roles';

export interface AuthResponse {
  token: string;
  rol: string;
  role: string;
  idRol: RoleId;
  usuario: string;
  categoriasAsignadas: number[];
}

export interface AuthSession {
  token: string;
  roleId: RoleId;
  roleName: string;
  email: string;
  categoryIds: number[];
  expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/auth';
  private readonly sessionKey = 'cacc_session';

  login(credenciales: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(response => this.guardarSesion(response))
    );
  }

  private guardarSesion(response: AuthResponse): void {
    const payload = this.decodePayload(response.token);
    if (!response.token || !payload || !Number.isInteger(Number(response.idRol))) {
      throw new Error('La respuesta de autenticación no contiene una sesión válida.');
    }
    const session: AuthSession = {
      token: response.token,
      roleId: Number(response.idRol) as RoleId,
      roleName: response.rol,
      email: response.usuario,
      categoryIds: (response.categoriasAsignadas ?? []).map(Number).filter(Number.isInteger),
      expiresAt: Number(payload['exp'] ?? 0) * 1000
    };
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_rol');
  }

  getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(this.sessionKey);
      if (!raw) return null;
      const session = JSON.parse(raw) as AuthSession;
      if (!session.token || !session.roleId || session.expiresAt <= Date.now()) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      this.logout();
      return null;
    }
  }

  getToken(): string | null { return this.getSession()?.token ?? null; }
  getRol(): string | null { return this.getSession()?.roleName ?? null; }
  getRoleId(): RoleId | null { return this.getSession()?.roleId ?? null; }
  getCategoryIds(): number[] { return this.getSession()?.categoryIds ?? []; }
  puede(capability: Capability): boolean { return hasCapability(this.getRoleId(), capability); }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_rol');
    localStorage.removeItem('cacc_jwt_token');
  }

  estaAutenticado(): boolean { return this.getSession() !== null; }

  obtenerDatosUsuario(): { email: string; rol: string } {
    const session = this.getSession();
    return { email: session?.email ?? '', rol: session?.roleName ?? '' };
  }

  private decodePayload(token: string): Record<string, unknown> | null {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
