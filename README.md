# 🎬 YT Downloader Pro

A professional full-stack YouTube downloader application with modern UI, multiple quality options, and **custom download path support**.

## ✨ New Features

### 📁 Custom Download Path
- **Set Your Own Path**: Choose where files are downloaded
- **Dynamic Path Updates**: Change download location anytime
- **Path Validation**: Automatic directory creation and validation
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Persistent Settings**: Your path preference is remembered

## 🚀 Core Features

### Video Download Resolutions
- **4K (2160p)** - Ultra HD quality (~8-15 MB/min)
- **2K (1440p)** - Quad HD quality (~4-8 MB/min)
- **1080p** - Full HD quality (~2-4 MB/min)
- **720p** - HD Ready quality (~1-2 MB/min)
- **480p** - Standard quality (~0.5-1 MB/min)
- **360p** - Low quality (~0.3-0.5 MB/min)

### Audio Download Qualities
- **320 kbps MP3** - Highest quality (~2.5MB/min)
- **256 kbps MP3** - High quality (~2MB/min)
- **192 kbps MP3** - Good quality (~1.5MB/min)
- **128 kbps MP3** - Standard quality (~1MB/min)
- **Best Available** - Original quality (Variable)

### Modern Web Interface
- 🎨 Beautiful gradient design with responsive layout
- � Mobile-friendly interface
- ⚡ Real-time download progress tracking
- � Instant video information display
- � **Custom download path management**
- 🌙 Dark mode support

## 🛠️ Quick Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Start

1. **Clone and install**:
   ```bash
   git clone <repository-url>
   cd yt-downloader-pro
   npm install
   ```

2. **Install dependencies for both frontend and backend**:
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend  
   cd ../frontend && npm install
   ```

3. **Start the application**:
   ```bash
   # Start backend (Terminal 1)
   cd backend && npm run dev
   
   # Start frontend (Terminal 2)
   cd frontend && npm run dev
   ```

4. **Open your browser**: Navigate to `http://localhost:3000`

## 📁 Setting Up Custom Download Path

### Via Web Interface
1. **View Current Path**: See your current download location at the top
2. **Change Path**: Click "📝 Change" button
3. **Enter New Path**: 
   - Windows: `C:\Downloads\YouTube`
   - macOS/Linux: `/home/user/Downloads/YouTube`
4. **Update**: Click "✅ Update" to save
5. **Auto-Creation**: Directory will be created if it doesn't exist

### Via Environment Variable
Set in `backend/.env`:
```env
DOWNLOAD_PATH=C:\Your\Custom\Path
```

### Default Paths
- **Windows**: `C:\Users\{Username}\Downloads\YT Downloads`
- **macOS**: `/Users/{Username}/Downloads/YT Downloads`
- **Linux**: `/home/{Username}/Downloads/YT Downloads`

## 📡 API Endpoints

### Download Path Management
```http
GET /api/download-path
# Returns: { "path": "/current/download/path" }

POST /api/download-path
Content-Type: application/json
{
  "path": "/new/download/path"
}
# Returns: { "success": true, "path": "/new/download/path" }
```

### Video Operations
```http
POST /api/info
Content-Type: application/json
{
  "url": "https://youtube.com/watch?v=..."
}

POST /api/video
Content-Type: application/json
{
  "url": "https://youtube.com/watch?v=...",
  "format": "1080p"
}

POST /api/audio  
Content-Type: application/json
{
  "url": "https://youtube.com/watch?v=...",
  "quality": "320"
}
```

## 🎯 Usage Guide

### Step-by-Step Process
1. **🔧 Configure Path**: Set your preferred download location
2. **📋 Paste URL**: Enter any valid YouTube video URL
3. **🔍 Get Info**: Click "Get Info" to analyze the video
4. **📊 View Details**: See title, duration, uploader, views
5. **🎯 Choose Quality**: Select video resolution or audio bitrate
6. **⬇️ Download**: Click any quality option to start downloading
7. **📁 Find Files**: Check your custom download path for files

### Supported URL Formats
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://m.youtube.com/watch?v=VIDEO_ID`

## 🔧 Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development
- **Axios** for API communication
- **Modern CSS** with gradients and responsive design

### Backend Stack
- **Express.js** with TypeScript
- **youtube-dl-exec** for video processing
- **Node.js File System** for path management
- **CORS** enabled for cross-origin requests

### File Processing
- **yt-dlp**: Latest YouTube downloading technology
- **Format Selection**: Intelligent quality matching
- **Error Handling**: Graceful fallbacks and user feedback
- **Progress Tracking**: Real-time download progress

## 🚀 Production Deployment

### Environment Setup
```env
# backend/.env
PORT=3001
NODE_ENV=production
DOWNLOAD_PATH=/var/www/downloads
```

### Build Process
```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build

# Start production
cd backend && npm start
```

## 📱 Cross-Platform Support

### Operating Systems
- ✅ **Windows 10/11**: Full support with native paths
- ✅ **macOS**: Complete compatibility
- ✅ **Linux**: Ubuntu, Debian, CentOS support

### Browsers
- ✅ **Chrome/Chromium**: Recommended
- ✅ **Firefox**: Full support
- ✅ **Safari**: macOS/iOS compatible
- ✅ **Edge**: Windows optimized

## ⚠️ Important Considerations

### Legal & Ethical Use
- � **Terms of Service**: Respect YouTube's ToS
- ©️ **Copyright**: Only download content you have rights to
- 🎯 **Personal Use**: Intended for personal, non-commercial use
- 🔒 **Privacy**: No user data collected or stored

### Technical Limitations
- 📏 **File Size**: Large files may take longer to process
- 🌐 **Network**: Download speed depends on internet connection
- 💾 **Storage**: Ensure sufficient disk space in download path
- 🔄 **Rate Limits**: Avoid excessive requests to prevent blocking

## 🆘 Troubleshooting

### Common Path Issues
```bash
# Permission denied
sudo chmod 755 /your/download/path

# Path doesn't exist
# App will auto-create, or manually:
mkdir -p /your/download/path
```

### Download Problems
1. **Invalid URL**: Ensure YouTube URL is correct
2. **Network Issues**: Check internet connection
3. **Path Permissions**: Verify write access to download folder
4. **Disk Space**: Ensure sufficient storage available

### Development Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check ports
netstat -an | grep :3000
netstat -an | grep :3001
```

## � Updates & Maintenance

### Keeping Updated
- **yt-dlp**: Auto-updates through youtube-dl-exec
- **Dependencies**: Regular npm updates recommended
- **Security**: Monitor for security advisories

### Performance Optimization
- **Concurrent Downloads**: Limited to prevent overload
- **Cleanup**: Temporary files automatically removed
- **Caching**: Video info cached for repeated requests

## 📄 License & Credits

This project is for **educational purposes only**. 

### Credits
- **yt-dlp**: Core downloading functionality
- **React Team**: Frontend framework
- **Express.js**: Backend framework
- **Community**: Open source contributors

---

**🎬 Made with ❤️ for seamless YouTube downloading**

*Remember: Always respect content creators and platform terms of service*