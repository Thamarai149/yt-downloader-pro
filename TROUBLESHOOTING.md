# YouTube Downloader Troubleshooting Guide

## Empty File Error Fix

The "empty file" error has been addressed with multiple improvements:

### What Was Fixed

1. **Multiple Format Strategies**: The downloader now tries 3 different format selection strategies for each download:
   - Strategy 1: Preferred formats (MP4 video + M4A audio)
   - Strategy 2: Any compatible formats
   - Strategy 3: Simple single-file download
   
2. **Better Error Handling**: Each strategy is attempted sequentially until one succeeds

3. **Improved Logging**: Detailed console output shows which strategy worked

4. **Android Client Extractor**: Uses YouTube's Android client API for better compatibility

### Testing the Fix

#### Method 1: Use the Test Script

Run the diagnostic test script to verify yt-dlp works correctly:

```bash
node test-download.js
```

This will:
- Test download with your video URL
- Show detailed progress
- Report file size and success/failure
- Help identify if the issue is with yt-dlp or the server code

#### Method 2: Test Manually with yt-dlp

Test directly from command line:

```bash
# Test 1: Simple best quality
yt-dlp -f "best" "YOUR_VIDEO_URL" -o "test1.mp4"

# Test 2: Merge video+audio
yt-dlp -f "bestvideo+bestaudio" --merge-output-format mp4 "YOUR_VIDEO_URL" -o "test2.mp4"

# Test 3: With Android client
yt-dlp -f "bestvideo+bestaudio" --merge-output-format mp4 --extractor-args "youtube:player_client=android" "YOUR_VIDEO_URL" -o "test3.mp4"
```

#### Method 3: Use the Diagnostic API

Start the server and visit:
```
http://localhost:2006/api/diagnostic?url=YOUR_VIDEO_URL
```

This will show:
- yt-dlp version
- FFmpeg availability
- All available formats for the video
- Video and audio format details

### Common Issues and Solutions

#### Issue: "The downloaded file is empty"

**Possible Causes:**
1. Video format not available
2. YouTube blocking the request
3. FFmpeg not installed or not in PATH
4. Video is restricted/private

**Solutions:**
1. Try "Best Available Quality" option
2. Update yt-dlp: `pip install -U yt-dlp`
3. Install FFmpeg: Download from https://ffmpeg.org/
4. Try a different video to test

#### Issue: "403 Forbidden"

**Possible Causes:**
1. YouTube rate limiting
2. Video requires authentication
3. Geographic restrictions

**Solutions:**
1. Wait a few minutes and try again
2. Use browser cookies (Firefox): The app already tries this
3. Try a different video

#### Issue: Only low resolutions available

**Possible Causes:**
1. Video is still processing
2. Video was uploaded in low quality
3. Format detection issue

**Solutions:**
1. Wait for YouTube to finish processing
2. Check the video on YouTube directly
3. Use the diagnostic API to see all available formats

### Verifying FFmpeg Installation

FFmpeg is required for merging video and audio streams (needed for 1080p+):

```bash
# Check if FFmpeg is installed
ffmpeg -version

# If not installed, download from:
# https://ffmpeg.org/download.html
```

### Server Logs

The server now provides detailed logs for each download:

```
[downloadId] Download started
[downloadId] Quality requested: 1080
[downloadId] Will try 3 format strategies
[downloadId] Attempt 1/3: 1080p MP4+M4A
[downloadId] Format: bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/...
[downloadId] ✓ SUCCESS with strategy: 1080p MP4+M4A (125.50 MB)
```

Watch the server console for these messages to understand what's happening.

### Still Having Issues?

1. Check yt-dlp version: `yt-dlp --version` (should be 2026.3.3 or newer)
2. Update yt-dlp: `pip install -U yt-dlp`
3. Verify FFmpeg: `ffmpeg -version`
4. Test with the diagnostic script: `node test-download.js`
5. Check server logs for detailed error messages
6. Try the diagnostic API endpoint

### Changes Made

- Added multi-strategy format selection with automatic fallback
- Improved error messages with specific causes
- Added detailed logging for debugging
- Created diagnostic endpoint for testing
- Added test script for manual verification
- Better file size validation (>1KB instead of >0 bytes)
- Automatic cleanup of failed downloads
