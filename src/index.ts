import express from "express";
import type { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express with TypeScript!");
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
