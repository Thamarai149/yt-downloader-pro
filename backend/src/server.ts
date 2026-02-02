
import express from "express";
import cors from "cors";
import routes from "./routes/download.routes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api", routes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Initialize Telegram bot after server setup
const initBot = async () => {
  try {
    const botModule = await import("./bot");
    const bot = botModule.default;
    if (bot) {
      console.log(`🤖 Telegram Bot is active`);
    }
  } catch (error) {
    // Bot initialization failed, but server should continue
    console.log(`⚠️ Telegram Bot initialization failed or no token provided`);
  }
};

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  initBot();
});
