# 🚀 YT Downloader Pro

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Python: 3.x](https://img.shields.io/badge/Python-3.x-green.svg)](https://www.python.org/)
[![Node: 18+](https://img.shields.io/badge/Node-18+-blue.svg)](https://nodejs.org/)

**YT Downloader Pro** is a premium, high-performance YouTube content extraction suite designed for speed, quality, and aesthetics. Standardized on the **MKV** format and powered by the latest **yt-dlp** engine to guarantee the absolute maximum resolution available (up to 4K).

---

## ✨ The Premium Experience

### 💎 Stunning Visuals
Experience a state-of-the-art **Glassmorphism** interface featuring:
- **Dynamic Backgrounds**: Custom abstract flowing gradients with animated "orb" effects.
- **Sleek Branding**: A professional circular logo integrated directly into the workspace.
- **Micro-Animations**: Smooth transitions and real-time progress tracking.

### 🎯 Quality First
- **Maximum Resolution**: Backend logic automatically enforces `--format-sort res,quality`. No more settling for low-quality defaults.
- **MKV Optimized**: Every video download is optimized for the MKV container, supporting the best modern codecs like AV1 and VP9.
- **High-Bitrate Audio**: Crystal clear audio extraction in FLAC, MP3, or WAV formats.

---

## 🚀 Core Features

- **Direct High-Res Download**: Paste a URL and get the best file instantly.
- **MKV Video Tool**: Native MKV support for all video content.
- **Background Queue**: Add multiple URLs and let the app handle them in the background.
- **Subscription Sync**: Automatically track and download new content from your favorite channels.
- **Professional Merge Tool**: High-quality merging of separate video and audio streams.

---

## 📋 Prerequisites

Before starting, ensure you have **Python** and **FFmpeg** installed on your system.

```bash
# Update to the latest yt-dlp engine
pip install -U yt-dlp
```

---

## 🛠️ Getting Started

1. **Start the Server**:
   ```bash
   npm run web
   ```
2. **Access the UI**:
   Navigate to `http://localhost:2006` in your modern web browser.

3. **CLI Usage** (Optional):
   ```bash
   node src/cli.js download "URL" -t video -q best
   ```

---

## ⚖️ Privacy & Fair Use

- **Account-Free**: No logins or credentials required.
- **Privacy Focused**: No tracking or data collection.
- **Fair Use**: This tool is built for personal archiving and educational purposes. Please respect YouTube's Terms of Service and local copyright laws.

---

## 📝 License

Distributed under the **ISC License**. See `LICENSE` for more information.
