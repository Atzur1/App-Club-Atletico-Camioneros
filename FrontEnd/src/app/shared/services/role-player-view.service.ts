import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { PortalAccessService } from '../auth/portal-access.service';
import { ClubPortalApiService } from './club-portal-api.service';

export interface RolePlayerRow { id: number; nombreCompleto: string; dni: string; posicion: string; edad: string; categoria: string; fechaNacimiento: string; }
export interface RoleCategoryRow { id: number; nombre: string; cantidadJugadores: string; asociacion: string; }
export interface RolePlayerProfile {
  id: number; nombreCompleto: string; posicion: string; fechaNacimiento: string; edad: string;
  peso: string; altura: string; pieHabil: string; grupoSanguineo: string; tutor: string;
  telefonoTutor: string; domicilio: string; patologias: string; lesiones: string[];
  observacionesMedicas: string; historialPartidos: any[]; totalMinutosJugados: string;
}

@Injectable({ providedIn: 'root' })
export class RolePlayerViewService {
  private readonly api = inject(ClubPortalApiService);
  private readonly access = inject(PortalAccessService);
  private readonly medicalIds = new Map<number, number>();

  players(): Observable<RolePlayerRow[]> {
    // The API is authoritative for DT membership (including bridge-table assignments).
    return this.api.listPlayers().pipe(
      map(rows => this.access.visiblePlayers(rows).map(row => this.toRow(row))),
    );
  }

  categoryPlayers(categoryId: number): Observable<RolePlayerRow[]> {
    return this.api.listRoster(categoryId).pipe(map(rows => rows.map(row => this.toRow(row))));
  }

  categories(dtOnly = false): Observable<RoleCategoryRow[]> {
    return this.api.listCategories().pipe(map(rows => {
      return (dtOnly ? this.access.visibleCategories(rows) : rows)
        .map(row => ({ id: row.idCategoria, nombre: row.nombreCategoria, cantidadJugadores: String(row.cantidadJugadores ?? 0), asociacion: row.asociacion ?? '' }));
    }));
  }

  profile(id: number): Observable<RolePlayerProfile> {
    return forkJoin({
      player: this.api.getPlayer(id), medical: this.api.getMedicalRecord(id),
    }).pipe(map(({ player, medical }) => { this.medicalIds.set(id, medical.idFichaMedica); return this.toProfile(player, medical); }));
  }

  saveMedical(id: number, profile: RolePlayerProfile): Observable<unknown> {
    return this.api.saveMedicalRecord({
      idFichaMedica: this.medicalIds.get(profile.id) ?? id,
      idJugador: profile.id,
      grupoSanguineo: profile.grupoSanguineo,
      antecedentesSalud: profile.patologias,
      observaciones: profile.observacionesMedicas,
      historialLesiones: profile.lesiones.join('\n'),
    });
  }

  private toRow(row: any): RolePlayerRow {
    const birth = row.fechaDeNacimiento ?? row.fechaNacimiento;
    const age = birth ? Math.max(0, new Date().getFullYear() - new Date(birth).getFullYear()) : 0;
    return {
      id: row.idJugador ?? row.id,
      nombreCompleto: `${row.nombre ?? ''} ${row.apellido ?? ''}`.trim(),
      dni: row.dni ?? '',
      posicion: String(row.posicionCancha ?? row.posicion ?? '').toUpperCase(),
      edad: age ? `${age} AÑOS` : 'SIN INFORMAR',
      categoria: row.nombreCategoria ?? row.categoria ?? 'Sin categoría',
      fechaNacimiento: birth ? new Date(birth).toLocaleDateString('es-AR') : 'Sin informar',
    };
  }

  private toProfile(player: any, medical: any): RolePlayerProfile {
    const row = this.toRow(player);
    const tutor = player.tutor ?? {};
    return {
      ...row, fechaNacimiento: player.fechaDeNacimiento ?? player.fechaNacimiento ?? 'Sin informar',
      peso: player.peso != null ? `${player.peso} Kg` : 'Sin informar', altura: player.altura != null ? `${player.altura} m` : 'Sin informar',
      pieHabil: player.pieHabil ?? 'Sin informar', grupoSanguineo: medical?.grupoSanguineo ?? 'Sin informar',
      tutor: `${tutor.nombre ?? ''} ${tutor.apellido ?? ''}`.trim() || 'Sin informar', telefonoTutor: tutor.telefono ?? 'Sin informar',
      domicilio: player.domicilio ?? 'Sin informar', patologias: medical?.antecedentesSalud ?? medical?.patologias ?? '',
      lesiones: String(medical?.historialLesiones ?? '').split(/\r?\n/).filter(Boolean), observacionesMedicas: medical?.observaciones ?? '',
      historialPartidos: player.partidos ?? [], totalMinutosJugados: `${(player.partidos ?? []).reduce((sum: number, game: any) => sum + Number(game.minutos ?? 0), 0)}'`,
    };
  }
}
