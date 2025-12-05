# WhatsApp OTP Service - Implementation Guide

## Overview
Project `wa_otp` adalah service terpisah yang berfungsi untuk mengirim OTP via WhatsApp menggunakan `whatsapp-web.js`. Service ini akan menerima HTTP request dari backend dan mengirim pesan WhatsApp.

## Current Code
```javascript
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const { Client, LocalAuth } = pkg;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// Generate QR code in terminal
client.on("qr", (qr) => {
  console.log("QR CODE RECEIVED");
  qrcode.generate(qr, { small: true });
});

// Ready event
client.on("ready", () => {
  console.log("Client is ready!");
});

// Authenticated event
client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

// Message received event
client.on("message", (msg) => {
  if (msg.body === "!ping") {
    msg.reply("pong");
  }
});

// Initialize client
client.initialize();

export default client;
```

## What Needs to Be Added

### 1. Install Dependencies
```bash
npm install express cors body-parser
```

### 2. Create Express Server
Buat file baru `server.js` atau update file utama dengan menambahkan Express server:

```javascript
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
      error: error.message,
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
      error: error.message,
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
```

### 3. Update package.json
```json
{
  "name": "wa-otp-service",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "whatsapp-web.js": "^1.23.0",
    "qrcode-terminal": "^0.12.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Service
```bash
npm start
```

### 3. Scan QR Code
- QR code akan muncul di terminal
- Scan dengan WhatsApp di HP Anda
- Tunggu sampai muncul "✅ WhatsApp Client is ready!"

### 4. Test Service
```bash
# Health check
curl http://localhost:3005/health

# Send test message
curl -X POST http://localhost:3005/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+6281234567890",
    "message": "Test message from WhatsApp OTP Service"
  }'
```

## API Endpoints

### 1. Health Check
**GET** `/health`

Response:
```json
{
  "success": true,
  "status": "ready",
  "message": "WhatsApp client is ready"
}
```

### 2. Send Message (REQUIRED)
**POST** `/send-message`

Request:
```json
{
  "phoneNumber": "+6281234567890",
  "message": "Your message here"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "xxx",
    "timestamp": "2024-12-04T10:00:00.000Z",
    "to": "+6281234567890"
  }
}
```

Response (Error):
```json
{
  "success": false,
  "message": "Failed to send message",
  "error": "Error details"
}
```

### 3. Client Info (Optional)
**GET** `/client-info`

Response:
```json
{
  "success": true,
  "data": {
    "phoneNumber": "6281234567890",
    "platform": "android",
    "pushname": "Your Name"
  }
}
```

## Phone Number Format

Service akan menerima nomor dalam format `+62` dan convert ke format WhatsApp:
- Input: `+6281234567890`
- WhatsApp format: `6281234567890@c.us`

## Integration with Backend

Backend akan memanggil endpoint `/send-message`:

```javascript
// Backend code (sudah diimplementasikan)
const response = await fetch('http://localhost:3005/send-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+6281234567890',
    message: '*Kode OTP Anda*\n\n123456\n\nKode ini berlaku selama 5 menit.'
  })
});
```

## Troubleshooting

### QR Code tidak muncul
- Pastikan tidak ada session lama di folder `.wwebjs_auth`
- Hapus folder tersebut dan restart service

### Message tidak terkirim
- Pastikan WhatsApp client sudah ready (check `/health`)
- Pastikan nomor tujuan valid dan terdaftar di WhatsApp
- Check console log untuk error details

### Client disconnected
- Scan QR code lagi
- Pastikan HP tetap terhubung internet
- Jangan logout dari WhatsApp Web di HP

## Production Considerations

1. **Process Manager**: Gunakan PM2 untuk auto-restart
```bash
npm install -g pm2
pm2 start server.js --name wa-otp-service
```

2. **Logging**: Tambahkan logging ke file
3. **Error Handling**: Tambahkan retry mechanism
4. **Security**: Tambahkan API key authentication
5. **Rate Limiting**: Batasi jumlah request per IP
6. **Monitoring**: Setup health check monitoring

## Environment Variables (Optional)

Buat file `.env`:
```env
PORT=3005
NODE_ENV=production
```

Update code untuk menggunakan env:
```javascript
const PORT = process.env.PORT || 3005;
```

## Testing Flow

1. Start wa_otp service: `npm start`
2. Scan QR code
3. Wait for "Client is ready"
4. Start backend: `npm run dev`
5. Test OTP request dari backend
6. Check WhatsApp untuk menerima OTP

## Summary

Service ini harus:
✅ Running di port 3005
✅ Memiliki endpoint POST `/send-message`
✅ Accept JSON dengan `phoneNumber` dan `message`
✅ Return JSON response dengan status
✅ Handle phone number format +62
✅ WhatsApp client sudah authenticated (QR scanned)
