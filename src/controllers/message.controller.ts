import { Request, Response } from "express";
import { WhatsAppService } from "../services/whatsapp.service";
import { ApiUtils } from "../utils/api.utils";

export class MessageController {
  private whatsAppService: WhatsAppService;

  constructor() {
    this.whatsAppService = WhatsAppService.getInstance();
  }

  async sendChat(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, message } = req.body;

      // Validation
      if (!phoneNumber || !message) {
        ApiUtils.badRequestResponse(
          res,
          "phoneNumber and message are required"
        );
        return;
      }

      const clientStatus = this.whatsAppService.getClientStatus();
      if (!clientStatus.ready) {
        ApiUtils.serviceUnavailableResponse(
          res,
          "WhatsApp client is not ready. Please scan QR code first."
        );
        return;
      }

      // Send chat (WhatsAppService will handle phone number formatting)
      const result = await this.whatsAppService.sendChat(phoneNumber, message);

      ApiUtils.successResponse(res, "Chat sent successfully", {
        messageId: result.id._serialized,
        timestamp: new Date().toISOString(),
        to: phoneNumber,
      });
    } catch (error) {
      console.error("❌ Error sending chat:", error);
      ApiUtils.errorResponse(
        res,
        "Failed to send chat",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
