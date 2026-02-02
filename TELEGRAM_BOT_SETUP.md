# 🤖 Telegram Bot Setup Instructions

## ✅ Current Status
Your Telegram bot token is already configured in `backend/.env`:
```
TELEGRAM_BOT_TOKEN=8239669816:AAE1fF0OyErotwkpVWt8Hk6ZeKrRNPytZI8
```

## 🚀 How to Start the Bot

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **You should see these messages:**
   ```
   🤖 Bot module loaded
   🚀 Backend running on port 5000
   🤖 Telegram Bot started successfully!
   🤖 Telegram Bot is active
   ```

## 🔧 If You See Token Errors

If you see:
```
⚠️ TELEGRAM_BOT_TOKEN not found. Telegram bot will not start.
```

**Fix it by:**

1. **Check your .env file** (`backend/.env`):
   ```
   PORT=5000
   NODE_ENV=development
   TELEGRAM_BOT_TOKEN=8239669816:AAE1fF0OyErotwkpVWt8Hk6ZeKrRNPytZI8
   ```

2. **Restart the server:**
   ```bash
   cd backend
   npm run dev
   ```

## 📱 How to Use Your Bot

1. **Find your bot on Telegram:**
   - Search for your bot's username (the one you set with @BotFather)
   - Or use the link provided by @BotFather

2. **Start chatting:**
   - Send `/start` to see the welcome message
   - Send any YouTube URL to begin downloading

## 🎯 Bot Commands

- `/start` - Welcome message and overview
- `/help` - Detailed help and instructions
- `/info` - Get video information
- `/audio` - Download audio with quality selection
- `/video` - Download video with resolution selection
- `/formats` - Show all available options
- `/audioquality` - Audio quality guide
- `/status` - Bot status and system info
- `/cancel` - Cancel current operation

## 🔄 How to Get a New Bot Token (if needed)

1. **Message @BotFather on Telegram**
2. **Send `/newbot`**
3. **Follow the prompts:**
   - Choose a name for your bot (e.g., "YT Downloader Pro")
   - Choose a username ending in "bot" (e.g., "ytdownloaderpro_bot")
4. **Copy the token** and add it to `backend/.env`

## 🛠️ Troubleshooting

### Bot Not Responding
- Check if the server is running
- Verify the token is correct in `.env`
- Make sure there are no spaces around the token

### "Polling Error"
- The token might be invalid
- Another instance might be using the same token
- Check your internet connection

### Downloads Not Working
- Ensure yt-dlp is installed on your system
- Check if FFmpeg is installed
- Verify the downloads directory exists

## 📁 File Locations

All downloaded files are saved to:
```
C:\Users\THAMARAISELVAN\Videos\Video Song\
```

## 🎉 Success Indicators

When everything is working, you'll see:
- ✅ Server starts without errors
- ✅ Bot responds to `/start` command
- ✅ Downloads work and files are saved locally
- ✅ Files are also sent via Telegram (if under 50MB)

---

**Your bot is ready to use! 🚀**