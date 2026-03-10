# yt-audio-pro

A modern, fast, and feature-rich YouTube audio downloader package and CLI tool. Powered by `yt-dlp` to ensure maximum compatibility and extraction reliability.

## Features

- **Media Extraction:** Download high-quality audio (MP3, M4A, FLAC, WAV) AND video (MP4, MKV) directly from YouTube URLs.
- **Video Resolutions:** Supports 360p, 480p, 720p, 1080p, 2K, and 4K resolutions based on availability.
- **Smart Formatting:** Sensible defaults with configurable profiles ("podcast", "music-hd", "voice-only").
- **Metadata Embedding:** Automatically extracts and embeds ID3 tags (title, artist, album, duration) and cover art.
- **Background Queue:** Built-in download manager (`Queue`) with concurrency control, pausing, resuming, and retry logic.
- **Subscriptions:** "Watch" channels or playlists over time and automatically download new videos.
- **Plugin Hooks:** Hook into `onDownloadStart`, `onDownloadProgress`, and `onDownloadComplete` to add your own post-processing (e.g. tagging, uploading).
- **Local Caching:** Avoid re-downloading URLs you've already saved.

## Prerequisites

You **must** have [yt-dlp](https://github.com/yt-dlp/yt-dlp) and `ffmpeg` installed on your system path.
```bash
pip install -U yt-dlp
```

## Installation

```bash
npm install yt-audio-pro
# or install globally for CLI use
npm install -g yt-audio-pro
```

## CLI Usage

### Basic Download
```bash
yt-audio-pro download "https://www.youtube.com/watch?v=dQw4w9WgXcQ" -t video -f mp4 -q 1080p
```

### Options available:
- `-t, --type <type>`: audio, video (default: audio)
- `-f, --format <format>`: mp3, flac, wav for audio; mp4, mkv for video
- `-q, --quality <quality>`: best, 320, 192 for audio; best, 4k, 2k, 1080p, 720p, 480p, 360p for video
- `-o, --output <dir>`: output directory (default: ./audio)
- `-p, --profile <profile>`: Use a config profile (e.g. podcast, music-hd)
- `--no-metadata`: Disable ID3 tags
- `--no-thumbnail`: Disable cover art embedding

### Background Queue
```bash
yt-audio-pro queue "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

### Subscriptions
Watch a playlist or channel and sync new items:
```bash
yt-audio-pro subscribe "My Feed" "https://www.youtube.com/playlist?list=..."
yt-audio-pro list
yt-audio-pro sync
```

## API Usage

The package exposes a clean promise-based API for Node.js integrations:

```javascript
const { downloadAudio, Queue, Config, PluginSystem } = require('yt-audio-pro');

// 1. Simple Download
downloadAudio('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
  format: 'mp3',
  quality: '320',
  outputDir: './my-music',
  embedMetadata: true
}).then(result => console.log('Done!', result))
  .catch(err => console.error('Error:', err));

// 2. Custom Profiles
Config.setProfile('ultra-low', { format: 'mp3', quality: '96', embedMetadata: false });

downloadAudio('https://youtu.be/...', { profile: 'ultra-low' });

// 3. Queue Management
Queue.add('https://youtu.be/1...');
Queue.add('https://youtu.be/2...');

Queue.on('completed', ({ item, result }) => {
  console.log(`Saved ${item.url} to ${result.outputDir}`);
});

// 4. Plugin Hooks
PluginSystem.register('onDownloadComplete', (data) => {
  if (data.success) {
    console.log(`Plugin hook triggering for: ${data.url}`);
    // e.g., send via webhook or begin speech-to-text
  }
});
```

## Privacy & Safety
- **No Login Required:** Does not require Google/YouTube credentials.
- **Rate-Limiting Respect:** `yt-dlp` automatically handles request pacing. The `Queue` manager enforces a strict concurrency limit (default: 2) to avoid aggressive network scraping.
- **Fair Use:** This tool is intended strictly for personal use, archiving, and fair-use cases. Users should respect copyright laws and YouTube's Terms of Service. It strips out bypassing mechanisms to stay compliant.

## License
ISC
