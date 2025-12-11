import { Client, LocalAuth } from "whatsapp-web.js";
import { APP_CONFIG } from "../config/app.config";
import { QRUtils } from "../utils/qr.utils";

export class WhatsAppService {
  private static instance: WhatsAppService;
  private client: Client;
  private isClientReady: boolean = false;
  private autoReplyEnabled: boolean = false;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: APP_CONFIG.whatsapp.headless,
        args: APP_CONFIG.whatsapp.puppeteerArgs,
      },
    });

    this.setupEventListeners();
    this.initialize();
  }

  private setupEventListeners(): void {
    this.client.on("qr", (qr) => {
      QRUtils.generateQR(qr);
    });

    this.client.on("ready", () => {
      this.isClientReady = true;
      console.log("✅ WhatsApp Client is ready!");
    });

    this.client.on("authenticated", () => {
      console.log("✅ AUTHENTICATED");
    });

    this.client.on("disconnected", (reason) => {
      this.isClientReady = false;
      console.log("❌ Client was disconnected:", reason);
    });

    this.client.on("message", async (msg) => {
      if (!msg.fromMe && !msg.from.includes("g.us")) {
        if (this.autoReplyEnabled) {
          try {
            console.log(`📥 Received message: ${msg.body} from ${msg.from}`);
            await msg.reply(
              "Auto-reply feature is enabled but not fully implemented yet."
            );
          } catch (error) {
            console.error("❌ Error in auto-reply:", error);
            await msg.reply("Maaf, saya mengalami kesalahan.");
          }
        }

        // Keep the ping-pong test
        if (msg.body === "!ping") {
          msg.reply("pong");
        }
      }
    });
  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  public initialize(): void {
    this.client.initialize();
  }

  public getClientStatus(): { ready: boolean; autoReplyEnabled: boolean } {
    return {
      ready: this.isClientReady,
      autoReplyEnabled: this.autoReplyEnabled,
    };
  }

  public setAutoReply(enabled: boolean): void {
    this.autoReplyEnabled = enabled;
    console.log(
      `🤖 Auto-reply ${this.autoReplyEnabled ? "enabled" : "disabled"}`
    );
  }

  public async sendChat(phoneNumber: string, message: string): Promise<any> {
    if (!this.isClientReady) {
      throw new Error(
        "WhatsApp client is not ready. Please scan QR code first."
      );
    }

    // Format phone number properly
    let formattedNumber = phoneNumber.replace(/\D/g, ""); // Remove all non-digits
    
    // Add country code if not present (assuming Indonesia +62)
    if (formattedNumber.startsWith("0")) {
      formattedNumber = "62" + formattedNumber.substring(1);
    } else if (!formattedNumber.startsWith("62")) {
      formattedNumber = "62" + formattedNumber;
    }

    const chatId = formattedNumber + "@c.us";
    console.log(`📱 Sending chat to: ${chatId}`);
    
    // Check if number exists on WhatsApp first
    const numberId = await this.client.getNumberId(chatId);
    if (!numberId) {
      throw new Error(`Phone number ${phoneNumber} is not registered on WhatsApp`);
    }

    return await this.client.sendMessage(numberId._serialized, message);
  }
}
