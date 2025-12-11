import { Router } from "express";
import { WhatsAppService } from "../services/whatsapp.service";
import { MessageController } from "../controllers/message.controller";

const router = Router();
const messageController = new MessageController();

// Health check endpoint
router.get("/health", (req, res) => {
  const whatsAppService = WhatsAppService.getInstance();
  const clientStatus = whatsAppService.getClientStatus();

  res.json({
    success: true,
    status: clientStatus.ready ? "ready" : "not_ready",
    message: clientStatus.ready
      ? "WhatsApp client is ready"
      : "WhatsApp client is not ready. Please scan QR code.",
  });
});

// Send chat endpoint
router.post("/send-chat", (req, res) => {
  messageController.sendChat(req, res);
});

export default router;
