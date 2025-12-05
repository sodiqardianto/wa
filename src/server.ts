import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const { Client, LocalAuth } = pkg;

// Initialize Express
const app = express();
const PORT = 3005;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// Track client status
let isClientReady = false;

// Generate QR code in terminal
client.on("qr", (qr) => {
  console.log("\n========================================");
  console.log("📱 SCAN QR CODE WITH WHATSAPP");
  console.log("========================================");
  qrcode.generate(qr, { small: true });
  console.log("========================================\n");
});

// Ready event
client.on("ready", () => {
  isClientReady = true;
  console.log("✅ WhatsApp Client is ready!");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Authenticated event
client.on("authenticated", () => {
  console.log("✅ AUTHENTICATED");
});

// Disconnected event
client.on("disconnected", (reason) => {
  isClientReady = false;
  console.log("❌ Client was disconnected:", reason);
});

// Message received event (optional - for testing)
client.on("message", (msg) => {
  if (msg.body === "!ping") {
    msg.reply("pong");
  }
});

// Initialize WhatsApp client
client.initialize();

// ============================================
// API ENDPOINTS
// ============================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: isClientReady ? "ready" : "not_ready",
    message: isClientReady
      ? "WhatsApp client is ready"
      : "WhatsApp client is not ready. Please scan QR code.",
  });
});

// Send message endpoint (REQUIRED BY BACKEND)
app.post("/send-message", async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    console.log(`📤 Sending message to ${phoneNumber}...`);
    console.log(`📤 Message: ${message}`);
    // Validation
    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: "phoneNumber and message are required",
      });
    }

    // Check if client is ready
    if (!isClientReady) {
      return res.status(503).json({
        success: false,
        message: "WhatsApp client is not ready. Please scan QR code first.",
      });
    }

    // Format phone number for WhatsApp
    // Remove + and add @c.us
    const chatId = phoneNumber.replace(/\+/g, "") + "@c.us";

    console.log(`📤 Sending message to ${phoneNumber}...`);

    // Send message
    const result = await client.sendMessage(chatId, message);

    console.log(`✅ Message sent successfully to ${phoneNumber}`);

    res.json({
      success: true,
      message: "Message sent successfully",
      data: {
        messageId: result.id._serialized,
        timestamp: new Date().toISOString(),
        to: phoneNumber,
      },
    });
  } catch (error) {
    console.error("❌ Error sending message:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get client info endpoint (optional)
app.get("/client-info", async (req, res) => {
  try {
    if (!isClientReady) {
      return res.status(503).json({
        success: false,
        message: "Client is not ready",
      });
    }

    const info = client.info;
    res.json({
      success: true,
      data: {
        phoneNumber: info.wid.user,
        platform: info.platform,
        pushname: info.pushname,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get client info",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Send OTP endpoint (SPECIFIC FOR OTP)
app.post("/send-otp", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Validation
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "phoneNumber is required",
      });
    }

    // Check if client is ready
    if (!isClientReady) {
      return res.status(503).json({
        success: false,
        message: "WhatsApp client is not ready. Please scan QR code first.",
      });
    }

    // Format phone number for WhatsApp
    const chatId = phoneNumber.replace(/\+/g, "") + "@c.us";

    // Standard OTP message
    const otpMessage = "Your OTP code is: 123456"; // This should be replaced with actual OTP from backend

    console.log(`📤 Sending OTP to ${phoneNumber}...`);

    // Send OTP message
    const result = await client.sendMessage(chatId, otpMessage);

    console.log(`✅ OTP sent successfully to ${phoneNumber}`);

    res.json({
      success: true,
      message: "OTP sent successfully",
      data: {
        messageId: result.id._serialized,
        timestamp: new Date().toISOString(),
        to: phoneNumber,
      },
    });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Start Express server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🚀 WhatsApp OTP Service`);
  console.log(`========================================`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`========================================\n`);
  console.log("⏳ Waiting for WhatsApp client to be ready...");
  console.log("📱 Please scan QR code if prompted\n");
});

export default client;
