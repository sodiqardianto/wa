import { Request, Response } from "express";
import { WhatsAppService } from "../services/whatsapp.service";
import { ApiUtils } from "../utils/api.utils";

export class MessageController {
  private whatsAppService: WhatsAppService;

  constructor() {
    this.whatsAppService = new WhatsAppService();
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
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

      // Format phone number for WhatsApp
      const chatId = phoneNumber.replace(/\+/g, "") + "@c.us";

      // Send message
      const result = await this.whatsAppService.sendMessage(chatId, message);

      ApiUtils.successResponse(res, "Message sent successfully", {
        messageId: result.id._serialized,
        timestamp: new Date().toISOString(),
        to: phoneNumber,
      });
    } catch (error) {
      console.error("❌ Error sending message:", error);
      ApiUtils.errorResponse(
        res,
        "Failed to send message",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
