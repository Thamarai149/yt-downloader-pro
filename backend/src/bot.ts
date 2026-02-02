import TelegramBot from 'node-telegram-bot-api';
import ytdl from 'youtube-dl-exec';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

const token = process.env.TELEGRAM_BOT_TOKEN;

// Check if token exists before initializing bot
if (!token) {
  console.log('⚠️ TELEGRAM_BOT_TOKEN not found. Telegram bot will not start.');
  console.log('💡 To enable Telegram bot:');
  console.log('   1. Get a bot token from @BotFather on Telegram');
  console.log('   2. Add TELEGRAM_BOT_TOKEN=your_token_here to backend/.env');
  console.log('   3. Restart the server');
} else {
  console.log('🤖 Bot module loaded');
  
  const bot = new TelegramBot(token, { polling: true });
  const DOWNLOADS_DIR = path.resolve('downloads');

  // Ensure downloads directory exists
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }

  // Store user sessions with more detailed state
  const userSessions = new Map<number, { 
    url?: string; 
    videoInfo?: any; 
    selectedFormat?: string;
    selectedAudioQuality?: string;
    awaitingSelection?: 'video' | 'audio';
  }>();

  // Helper function to validate YouTube URL
  const isValidYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  // Helper function to format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Helper function to clean up files
  const cleanupFiles = (files: string[]) => {
    files.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch (error) {
          console.error(`Failed to delete file ${file}:`, error);
        }
      }
    });
  };

  // Function to sanitize filename
  const sanitizeFilename = (filename: string): string => {
    return filename
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .substring(0, 100); // Limit length
  };

  // Start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🎬 *Welcome to YT Downloader Pro Bot!*

I can help you download YouTube videos and audio. Here are my commands:

📋 *Available Commands:*
/start - Show this welcome message
/help - Show detailed help
/info - Get video information
/audio - Download audio with quality selection
/video - Download video with resolution selection
/formats - Show available video formats
/audioquality - Show audio quality options
/status - Check bot status
/cancel - Cancel current operation

🚀 *Quick Start:*
1. Send me a YouTube URL
2. Choose what you want to download
3. Select quality/resolution
4. I'll process and send it to you!

Just send me a YouTube link to get started! 🎵🎥
    `;
    
    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  });

  // Help command
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
📖 *Detailed Help - YT Downloader Pro*

🔗 *How to use:*
1. Send any YouTube URL (youtube.com or youtu.be)
2. Use commands to interact with the video

📋 *Commands:*

/info - Get video title, duration, and available formats
/audio - Download audio with quality selection (MP3/M4A/FLAC)
/video - Download video with resolution selection (144p-4K)
/formats - Show all available video quality options
/audioquality - Show available audio quality options

🎯 *Pro Tips:*
• Send URL first, then use commands
• Choose your preferred quality before downloading
• Audio downloads are faster and smaller
• Video downloads include audio automatically
• Higher quality = larger file size

⚠️ *Limitations:*
• File size limit: 50MB (Telegram limit)
• Processing time depends on video length
• Some videos may not be available due to restrictions

🆘 *Need help?* Use /status to check if bot is working properly.
    `;
    
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  });

  // Status command
  bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    const statusMessage = `
✅ *Bot Status: Online*

⏱️ *Uptime:* ${hours}h ${minutes}m
💾 *Active Sessions:* ${userSessions.size}
📁 *Downloads Directory:* ${fs.existsSync(DOWNLOADS_DIR) ? 'Ready' : 'Error'}
💿 *Save Location:* ./downloads/

🔧 *System Info:*
• Node.js: ${process.version}
• Platform: ${process.platform}
• Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB

All systems operational! 🚀
    `;
    
    bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
  });

  // Cancel command
  bot.onText(/\/cancel/, (msg) => {
    const chatId = msg.chat.id;
    userSessions.delete(chatId);
    bot.sendMessage(chatId, '❌ Operation cancelled. Session cleared.');
  });

  // Audio Quality command
  bot.onText(/\/audioquality/, (msg) => {
    const chatId = msg.chat.id;
    const session = userSessions.get(chatId);
    
    if (!session?.url) {
      bot.sendMessage(chatId, '❌ Please send a YouTube URL first!');
      return;
    }

    const qualityMessage = `
🎵 *Audio Quality Options:*

Choose your preferred audio quality:

1️⃣ **320 kbps MP3** - Highest quality, larger file
2️⃣ **256 kbps MP3** - High quality, balanced size
3️⃣ **192 kbps MP3** - Good quality, smaller file
4️⃣ **128 kbps MP3** - Standard quality, smallest file
5️⃣ **Best M4A** - Original quality M4A format
6️⃣ **FLAC** - Lossless quality (if available)

💡 *How to select:*
Use /audio then reply with the number (1-6)

📊 *Quality Guide:*
• 320 kbps: Studio quality, ~2.5MB/min
• 256 kbps: High quality, ~2MB/min  
• 192 kbps: Good quality, ~1.5MB/min
• 128 kbps: Standard quality, ~1MB/min
    `;
    
    bot.sendMessage(chatId, qualityMessage, { parse_mode: 'Markdown' });
  });

  // Info command
  bot.onText(/\/info/, async (msg) => {
    const chatId = msg.chat.id;
    const session = userSessions.get(chatId);
    
    if (!session?.url) {
      bot.sendMessage(chatId, '❌ Please send a YouTube URL first!');
      return;
    }

    try {
      bot.sendMessage(chatId, '🔍 Getting video information...');
      
      const info = await ytdl(session.url, { dumpSingleJson: true });
      const videoData = info as any;
      
      // Store video info in session
      session.videoInfo = videoData;
      userSessions.set(chatId, session);
      
      const infoMessage = `
📺 *Video Information*

🎬 *Title:* ${videoData.title || 'Unknown'}

📋 *Available Actions:*
/audio - Download MP3 audio (with quality selection)
/video - Download MP4 video (with resolution selection)
/formats - Show all quality options
/audioquality - Show audio quality guide
      `;
      
      bot.sendMessage(chatId, infoMessage, { parse_mode: 'Markdown' });
      
    } catch (error) {
      console.error('Error getting video info:', error);
      bot.sendMessage(chatId, '❌ Failed to get video information. Please check the URL and try again.');
    }
  });

  // Audio command
  bot.onText(/\/audio/, async (msg) => {
    const chatId = msg.chat.id;
    const session = userSessions.get(chatId);
    
    if (!session?.url) {
      bot.sendMessage(chatId, '❌ Please send a YouTube URL first!');
      return;
    }

    // Show audio quality selection
    const qualityMessage = `
🎵 *Select Audio Quality:*

1️⃣ **320 kbps MP3** - Highest quality (~2.5MB/min)
2️⃣ **256 kbps MP3** - High quality (~2MB/min)
3️⃣ **192 kbps MP3** - Good quality (~1.5MB/min)
4️⃣ **128 kbps MP3** - Standard quality (~1MB/min)
5️⃣ **Best M4A** - Original quality M4A format
6️⃣ **FLAC** - Lossless quality (if available)

💡 *Reply with a number (1-6) to select quality*
    `;
    
    session.awaitingSelection = 'audio';
    userSessions.set(chatId, session);
    
    bot.sendMessage(chatId, qualityMessage, { parse_mode: 'Markdown' });
  });

  // Handle YouTube URLs and quality selections
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Skip if it's a command
    if (!text || text.startsWith('/')) return;
    
    const session = userSessions.get(chatId);
    
    // Check if message contains a YouTube URL
    if (isValidYouTubeUrl(text)) {
      const newSession = userSessions.get(chatId) || {};
      newSession.url = text.trim();
      newSession.videoInfo = null; // Reset video info
      newSession.awaitingSelection = undefined; // Clear any pending selections
      userSessions.set(chatId, newSession);
      
      const responseMessage = `
✅ *YouTube URL received!*

🔗 *URL:* ${text}

📋 *What would you like to do?*
/info - Get video information
/audio - Download audio (with quality selection)
/video - Download video (with resolution selection)
/formats - Show all available options
/audioquality - Show audio quality guide

💡 *Tip:* Use /info first to see video details!
      `;
      
      bot.sendMessage(chatId, responseMessage, { parse_mode: 'Markdown' });
    } else if (text.includes('youtube.com') || text.includes('youtu.be')) {
      bot.sendMessage(chatId, '❌ Invalid YouTube URL format. Please send a valid YouTube link.');
    } else if (session?.awaitingSelection) {
      bot.sendMessage(chatId, '❌ Please select a valid option number or use /cancel to start over.');
    }
  });

  // Error handling
  bot.on('error', (error) => {
    console.error('Telegram Bot Error:', error);
  });

  bot.on('polling_error', (error) => {
    console.error('Polling Error:', error);
  });

  console.log('🤖 Telegram Bot started successfully!');
}

// Export the bot instance or null
const botInstance = token ? undefined : null;
export default botInstance;