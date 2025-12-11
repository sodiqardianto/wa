import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { APP_CONFIG } from "./config/app.config";
import chatRoutes from "./routes/chat.routes";
import { WhatsAppService } from "./services/whatsapp.service";

class App {
  public app: express.Application;
  private whatsAppService: WhatsAppService;

  constructor() {
    this.app = express();
    this.whatsAppService = new WhatsAppService();
    this.configureMiddleware();
    this.configureRoutes();
  }

  private configureMiddleware(): void {
    this.app.use(cors());
    this.app.use(bodyParser.json());
  }

  private configureRoutes(): void {
    this.app.use("/", chatRoutes);
  }

  public start(): void {
    this.app.listen(APP_CONFIG.port, () => {
      console.log(`\n========================================`);
      console.log(`🚀 WhatsApp Service`);
      console.log(`========================================`);
      console.log(`Server: http://localhost:${APP_CONFIG.port}`);
      console.log(`Health: http://localhost:${APP_CONFIG.port}/health`);
      console.log(`Send OTP: http://localhost:${APP_CONFIG.port}/send-otp`);
      console.log(`========================================\n`);
      console.log("⏳ Waiting for WhatsApp client to be ready...");
      console.log("📱 Please scan QR code if prompted\n");
    });
  }
}

export default App;
