import { Client, LocalAuth } from "whatsapp-web.js";
import { APP_CONFIG } from "../config/app.config";
import { QRUtils } from "../utils/qr.utils";

export class WhatsAppService {
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

  public async sendMessage(phoneNumber: string, message: string): Promise<any> {
    if (!this.isClientReady) {
      throw new Error(
        "WhatsApp client is not ready. Please scan QR code first."
      );
    }

    const chatId = phoneNumber.replace(/\+/g, "") + "@c.us";
    return await this.client.sendMessage(chatId, message);
  }
}
