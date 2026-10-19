namespace CACC.Entities
{
    // Estado de deuda de un jugador tal como lo informa el Portal Administrativo (api/estado-deuda). Ese portal es la
    // única fuente de verdad de la deuda: acá no se calcula nada.
    public class EstadoDeudaAdministrativo
    {
        public string Dni { get; set; } = string.Empty;
        public int IdJugador { get; set; }

        // "habilitado", "solo_entrenamientos", "inhabilitado" o "baja".
        public string Estado { get; set; } = string.Empty;
        public bool AccesoPermitido { get; set; }
        public int CuotasVencidas { get; set; }
        public decimal DeudaTotal { get; set; }
        public bool EnTermino { get; set; }
        public string? FechaBaja { get; set; }
    }
}
