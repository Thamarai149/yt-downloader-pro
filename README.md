# YT Downloader Pro

A professional full-stack YouTube downloader application with modern UI and multiple quality options.

## 🚀 Features

### Video Download Resolutions
- **4K (2160p)** - Ultra HD quality
- **2K (1440p)** - Quad HD quality  
- **1080p** - Full HD quality
- **720p** - HD Ready quality
- **480p** - Standard quality
- **360p** - Low quality for smaller files

### Audio Download Qualities
- **320 kbps MP3** - Highest quality (~2.5MB/min)
- **256 kbps MP3** - High quality (~2MB/min)
- **192 kbps MP3** - Good quality (~1.5MB/min)
- **128 kbps MP3** - Standard quality (~1MB/min)
- **Best Available** - Original quality

### Modern Web Interface
- 🎨 Beautiful gradient design with responsive layout
- 📱 Mobile-friendly interface
- ⚡ Real-time download progress tracking
- 🔍 Instant video information display
- 🎯 Quality availability detection
- 🌙 Dark mode support

### Telegram Bot Integration
- 🤖 Full-featured Telegram bot with all commands
- 📋 Interactive quality selection menus
- 💾 Files saved to custom directory
- 🔄 Session management per user
- 📊 Detailed progress updates

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- yt-dlp installed on system
- FFmpeg installed on system
- Python 3.7+ (for yt-dlp)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   copy .env.example .env
   ```
   
4. Add your Telegram bot token to `.env`:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Quick Start (Root Level)

Install all dependencies and start both servers:
```bash
npm install
npm run install:all
npm run dev
```

## 📡 API Endpoints

### Video Information
```http
POST /api/info
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=..."
}
```

### Download Video
```http
POST /api/video
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=...",
  "format": "1080p"  // or format_id
}
```

### Download Audio
```http
POST /api/audio
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=...",
  "quality": "320"  // optional: 320, 256, 192, 128, or "best"
}
```

## 🤖 Telegram Bot Commands

- `/start` - Welcome message and overview
- `/help` - Detailed help and instructions
- `/info` - Get video information
- `/audio` - Download audio with quality selection
- `/video` - Download video with resolution selection
- `/formats` - Show all available options
- `/audioquality` - Audio quality guide
- `/status` - Bot status and system info
- `/cancel` - Cancel current operation

## 📁 File Storage

Files are automatically saved to:
```
C:\Users\THAMARAISELVAN\Videos\Video Song\
```

### File Naming Convention
- **Audio**: `{VideoTitle}_{Quality}.{ext}`
- **Video**: `{VideoTitle}_{Resolution}p.mp4`

## 🎯 Quality Selection Logic

### Video Resolution Matching
The system automatically finds the best available format matching your requested resolution:
- Searches for exact height match first
- Falls back to closest available resolution
- Maintains aspect ratio and codec compatibility

### Audio Quality Processing
- **320-128 kbps**: Specific bitrate encoding
- **Best Available**: Uses original audio stream quality
- **Format Support**: MP3, M4A, FLAC (when available)

## 🔧 Technical Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Axios** for API communication
- **Modern CSS** with gradients and animations

### Backend
- **Express.js** with TypeScript
- **youtube-dl-exec** for video processing
- **FFmpeg** for video/audio merging
- **node-telegram-bot-api** for bot functionality

## 🚀 Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

### Build Backend
```bash
cd backend
npm run build
npm start
```

### Environment Variables
```env
PORT=5000
NODE_ENV=production
TELEGRAM_BOT_TOKEN=your_bot_token
```

## 📱 Mobile Support

The web interface is fully responsive and works on:
- 📱 Mobile phones (iOS/Android)
- 📟 Tablets
- 💻 Desktop computers
- 🖥️ Large screens

## ⚠️ Important Notes

- **File Size Limit**: Telegram has a 50MB file size limit
- **Large Files**: Files exceeding the limit are saved locally with notification
- **Copyright**: Respect YouTube's terms of service and copyright laws
- **Rate Limiting**: Be mindful of download frequency to avoid IP blocking

## 🔒 Privacy & Security

- ✅ No user registration required
- ✅ No data stored on servers
- ✅ Files processed locally
- ✅ Temporary files automatically cleaned up
- ✅ HTTPS support ready

## 🆘 Troubleshooting

### Common Issues
1. **"Failed to get video information"**
   - Check if URL is valid YouTube link
   - Ensure yt-dlp is installed and updated

2. **"Video not available"**
   - Video might be private or region-blocked
   - Try different video

3. **"Download failed"**
   - Check internet connection
   - Verify FFmpeg installation

### System Requirements
- **Windows**: FFmpeg and Python in PATH
- **macOS**: `brew install ffmpeg python`
- **Linux**: `apt install ffmpeg python3`

## 📄 License

This project is for educational purposes. Please respect YouTube's Terms of Service and copyright laws when using this application.

---

**Made with ❤️ for the YouTube downloading community**