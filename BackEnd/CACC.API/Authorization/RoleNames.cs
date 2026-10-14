namespace CACC.API.Authorization;

public static class RoleNames
{
    public const string Administrador = "Administrador (Tesorero)";
    public const string Administrativo = "Administrativo";
    public const string Medico = "Médico";
    public const string DirectorTecnico = "Director Técnico";
    public const string DonQr = "Don QR";
    public const string PreparadorFisico = "Preparador Físico";
    public const string Coordinador = "Coordinador";

    public const string LecturaDeportivaGlobal = Administrador + "," + Medico + "," + Coordinador;
    public const string LecturaDeportiva = LecturaDeportivaGlobal + "," + DirectorTecnico + "," + PreparadorFisico;
    public const string EscrituraFichaMedica = Administrador + "," + Medico;
}
