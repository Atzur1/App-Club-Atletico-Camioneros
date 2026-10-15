export interface CategorySummary {
  idCategoria: number;
  nombreCategoria: string;
  asociacion?: string | null;
  cantidadJugadores?: number;
  cantidadStaff?: number;
}

export interface PlayerSummary {
  idJugador: number;
  nombre: string;
  apellido: string;
  dni: string;
  nombreCompleto?: string;
  idCategoria?: number | null;
  nombreCategoria?: string | null;
  posicionCancha?: string | null;
  fechaNacimiento?: string | null;
  estadoCuota?: string | null;
}

export interface RosterPlayer {
  idJugador: number;
  nombreCompleto: string;
  dni: string;
  posicionCancha?: string | null;
  fechaNacimiento?: string | null;
}

export interface PlayerProfile extends PlayerSummary {
  fechaDeNacimiento?: string | null;
  domicilio?: string | null;
  clubOrigen?: string | null;
  peso?: number | null;
  altura?: number | null;
  pieHabil?: string | null;
  fichaMedica?: MedicalRecordSummary | null;
}

export interface MedicalRecordSummary {
  grupoSanguineo?: string | null;
  patologias?: string | null;
  historialLesiones?: string | null;
  observaciones?: string | null;
}

export interface MedicalRecord extends MedicalRecordSummary {
  idFichaMedica: number;
  idJugador: number;
  obraSocial?: string | null;
  numeroAfiliadoOs?: number | null;
  factor?: string | null;
  antecedentesSalud?: string | null;
  medicamentosCronicos?: string | null;
  condicionesCronicas?: string | null;
  aptoFisicoVencimiento?: string | null;
  fechaActualizacion?: string | null;
}

