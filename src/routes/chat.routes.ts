import { Router } from "express";
import { WhatsAppService } from "../services/whatsapp.service";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  const whatsAppService = new WhatsAppService();
  const clientStatus = whatsAppService.getClientStatus();

  res.json({
    success: true,
    status: clientStatus.ready ? "ready" : "not_ready",
    message: clientStatus.ready
      ? "WhatsApp client is ready"
      : "WhatsApp client is not ready. Please scan QR code.",
  });
});

export default router;
