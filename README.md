# yt-audio-pro

A premium, modern YouTube content extraction suite. Powered by the latest `yt-dlp` python module to ensure maximum resolution and bitrate extraction.

## ✨ Premium Experience

- **High Resolution Focus:** Automatically fetches the absolute best video (up to 4K) and audio bitrate available. No more low-quality defaults.
- **Glassmorphism UI:** A stunning web interface featuring animated background orbs, abstract flowing gradients, and a sleek circular brand logo.
- **MKV Optimized:** Standardized on the MKV format for video to ensure support for all modern high-definition codecs (AV1, VP9) and high-quality audio streams.

## 🚀 Key Features

- **Maximum Quality Enforced:** Direct backend sorting (`--format-sort res,quality`) ensures you never settle for 360p or 720p when 4K is available.
- **Modern Web Interface:** A completely redesigned visual experience with minimalist controls and real-time progress tracking.
- **Audio Extraction:** High-bitrate audio in MP3, M4A, FLAC, or WAV formats.
- **Background Queue:** Manage multiple downloads concurrently with background processing and error handling.
- **Subscriptions:** Monitor Channels or Playlists and automatically sync the newest content.
- **Merge Tool:** Professional tool to high-quality merge separate video and audio files into a single MKV.

## 📋 Prerequisites

You **must** have [Python](https://p3.org/) (for `yt-dlp` module) and `ffmpeg` installed on your system.
```bash
# Ensure yt-dlp is updated to the latest version
pip install -U yt-dlp
```

## 🛠️ Usage

### Web Interface
```bash
npm run web
```
Open your browser to `http://localhost:2006` to experience the premium downloader interface.

### CLI Basic Download
```bash
node src/cli.js download "URL" -t video -q best
```

### Options:
- `-t, --type <type>`: audio, video (default: audio)
- `-f, --format <format>`: mp3, flac, wav for audio; mkv for video (default: mkv)
- `-q, --quality <quality>`: Always defaults to "best" for maximum resolution. Specific height filters (1080p, 720p) can be requested.
- `-o, --output <dir>`: output directory (default: ./downloads)

## ⚖️ Privacy & Fair Use
- **No Login Needed:** High-speed downloads without requiring personal account details.
- **archiving & personal Use:** This tool is intended strictly for personal archiving and fair-use cases. Users should respect copyright laws and YouTube's Terms of Service.

## 📝 License
ISC
