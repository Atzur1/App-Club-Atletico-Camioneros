using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace CACC.API.Services;

public sealed record CredentialPdfData(
    string FirstName,
    string LastName,
    string Dni,
    byte[] QrPng,
    byte[]? PlayerPhoto = null);

public interface ICredentialPdfService
{
    byte[] Generate(CredentialPdfData data);
}

/// <summary>
/// Generates a two-sided CR80 credential. The first PDF page is the front and
/// the second page is the back so a printer can use duplex/flip-on-short-edge.
/// </summary>
public sealed class CredentialPdfService : ICredentialPdfService
{
    private const float CardWidthMm = 85.60f;
    private const float CardHeightMm = 53.98f;
    private readonly byte[] _officialLogo;

    public CredentialPdfService(string assetsDirectory)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(assetsDirectory);
        // Exact, unmodified institutional asset supplied by the project owner.
        // QuestPDF only controls its physical placement; the PNG bytes remain untouched.
        _officialLogo = File.ReadAllBytes(Path.Combine(assetsDirectory, "cacc-logo-official.png"));
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] Generate(CredentialPdfData data)
    {
        ArgumentNullException.ThrowIfNull(data);
        if (data.QrPng.Length == 0) throw new ArgumentException("The QR image is required.", nameof(data));

        var displayName = $"{data.FirstName} {data.LastName}".Trim().ToUpperInvariant();
        var displayDni = FormatDni(data.Dni);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigureCard(page);
                page.Content().Column(card =>
                {
                    card.Item().Height(15.7f, Unit.Millimetre)
                        .Background("#E6F1ED")
                        .PaddingHorizontal(4.5f, Unit.Millimetre)
                        .AlignMiddle()
                        .Column(header =>
                        {
                            header.Spacing(0);
                            header.Item().Text(displayName)
                                .FontFamily(Fonts.Arial).Bold().FontSize(12.5f).FontColor(Colors.Black);
                            header.Item().Text($"DNI: {displayDni}")
                                .FontFamily(Fonts.Arial).FontSize(13).FontColor("#5D5D5D");
                        });

                    card.Item().Height(CardHeightMm - 15.7f, Unit.Millimetre)
                        .PaddingLeft(6.2f, Unit.Millimetre)
                        .PaddingRight(4.1f, Unit.Millimetre)
                        .PaddingVertical(2.8f, Unit.Millimetre)
                        .Row(body =>
                        {
                            body.ConstantItem(31.5f, Unit.Millimetre)
                                .AlignCenter().AlignMiddle()
                                .Image(_officialLogo).FitArea();
                            body.RelativeItem()
                                .AlignRight().AlignMiddle()
                                .Width(32.5f, Unit.Millimetre)
                                .Height(32.5f, Unit.Millimetre)
                                .Image(data.QrPng).FitArea();
                        });
                });
            });

            container.Page(page =>
            {
                ConfigureCard(page);
                page.Content().Layers(layers =>
                {
                    // Vector-only background. The reference JPG is intentionally not used.
                    layers.Layer().Svg(BuildBackBackgroundSvg()).FitArea();

                    // QuestPDF emits this text as actual PDF glyphs rather than pixels.
                    layers.PrimaryLayer()
                        .PaddingLeft(5.5f, Unit.Millimetre)
                        .PaddingTop(14.3f, Unit.Millimetre)
                        .Row(content =>
                        {
                            content.ConstantItem(25f, Unit.Millimetre)
                                .Height(25f, Unit.Millimetre)
                                .Image(_officialLogo).FitArea();
                            content.RelativeItem()
                                .Height(25f, Unit.Millimetre)
                                .PaddingLeft(3.5f, Unit.Millimetre)
                                .AlignMiddle()
                                .Column(text =>
                                {
                                    text.Spacing(0);
                                    text.Item().Text("CLUB ATLETICO SOCIAL Y")
                                        .FontFamily(Fonts.Arial).Bold().FontSize(9.8f).FontColor(Colors.White);
                                    text.Item().Text("DEPORTIVO CAMIONEROS")
                                        .FontFamily(Fonts.Arial).Bold().FontSize(9.8f).FontColor(Colors.White);
                                });
                        });
                });
            });
        });

        return document.GeneratePdf();
    }

    private static string BuildBackBackgroundSvg()
    {
        return """
            <svg xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 856 540" preserveAspectRatio="none">
              <defs>
                <clipPath id="card-shape">
                  <rect x="0" y="0" width="856" height="540" rx="20" ry="20" />
                </clipPath>
              </defs>
              <g clip-path="url(#card-shape)">
                <rect width="856" height="540" fill="#ffffff" />
                <path d="M0 0 H248 L529 270 L248 540 H0 Z" fill="#008443" />
                <path d="M248 0 H568 L836 251 Q848 263 836 276 L568 540 H248 L529 270 Z"
                      fill="#006532" />
              </g>
            </svg>
            """;
    }

    private static void ConfigureCard(PageDescriptor page)
    {
        page.Size(CardWidthMm, CardHeightMm, Unit.Millimetre);
        page.Margin(0);
        page.DefaultTextStyle(style => style.FontFamily(Fonts.Arial));
    }

    private static string FormatDni(string rawDni)
    {
        var digits = new string((rawDni ?? string.Empty).Where(char.IsDigit).ToArray());
        if (digits.Length == 0) return rawDni ?? string.Empty;
        return long.TryParse(digits, out var number)
            ? number.ToString("N0", new System.Globalization.CultureInfo("es-AR"))
            : rawDni ?? string.Empty;
    }
}
