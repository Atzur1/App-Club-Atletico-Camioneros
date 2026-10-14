using QRCoder;

namespace CACC.API.Services
{
    public interface IQrService
    {
        byte[] GenerarQrCodePng(string credentialToken);
    }

    public class QrService : IQrService
    {
        public byte[] GenerarQrCodePng(string credentialToken)
        {
            // The QR contains only the opaque, signed credential token.
            using var qrGenerator = new QRCodeGenerator();
            using var qrCodeData = qrGenerator.CreateQrCode(credentialToken, QRCodeGenerator.ECCLevel.Q);

            // Usamos PngByteQRCode tal como exigen las convenciones del proyecto
            using var qrCode = new PngByteQRCode(qrCodeData);
            return qrCode.GetGraphic(20); // Tamaño de píxeles por módulo
        }
    }
}
