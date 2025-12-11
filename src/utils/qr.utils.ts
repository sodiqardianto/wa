import qrcode from "qrcode-terminal";

export class QRUtils {
  static generateQR(qr: string): void {
    console.log("\n========================================");
    console.log("📱 SCAN QR CODE WITH WHATSAPP");
    console.log("========================================");
    qrcode.generate(qr, { small: true });
    console.log("========================================\n");
  }
}
