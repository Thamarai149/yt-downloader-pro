const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PluginSystem = require('./plugins');

/**
 * Validates YouTube URL
 */
const isValidUrl = (url) => {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url);
};

/**
 * Check if yt-dlp is installed
 */
const checkEngine = () => {
  try {
    execSync('python -m yt_dlp --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Downloads media from YouTube
 * 
 * @param {string} url The YouTube URL (video or playlist)
 * @param {Object} options Download options
 * @param {string} options.type 'audio' or 'video'. Default: 'audio'
 * @param {string} options.format Output format (mp3, m4a, flac, wav for audio; mp4, mkv for video). Default: mp3
 * @param {string} options.quality Audio quality (best, 320, 192, 128) or Video resolution (best, 4k, 2k, 1080p, 720p, 480p, 360p). Default: best
 * @param {string} options.outputDir Output directory path. Default: ./downloads
 * @param {boolean} options.embedMetadata Embed ID3 tags/thumbnail. Default: true
 * @param {boolean} options.embedThumbnail Embed video thumbnail as cover art. Default: true
 * @param {string} options.profile Name of a config profile to use
 * @returns {Promise<Object>} Status of the download
 */
const downloadMedia = async (url, options = {}) => {
  if (!checkEngine()) {
    throw new Error('yt-dlp is not installed. Please install yt-dlp first.');
  }

  if (!isValidUrl(url)) {
    throw new Error('Invalid YouTube URL provided.');
  }

  const BASE_DOWNLOAD_DIR = 'C:\\Users\\THAMARAISELVAN\\Downloads\\ytdownloads';

  // Defaults
  let finalOptions = {
    type: 'audio',
    format: 'mp3',
    quality: 'best',
    outputDir: null, // We'll set this dynamically based on type if not provided
    embedMetadata: true,
    embedThumbnail: true,
    ...options
  };

  if (finalOptions.type === 'video' && (!options.format || options.format === 'mp3')) {
    finalOptions.format = 'mkv';
  }

  // If outputDir wasn't provided in options, default it based on the media type
  if (!finalOptions.outputDir) {
    finalOptions.outputDir = path.join(BASE_DOWNLOAD_DIR, finalOptions.type === 'video' ? 'videos' : 'audio');
  }

  // Ensure output directory
  if (!fs.existsSync(finalOptions.outputDir)) {
    fs.mkdirSync(finalOptions.outputDir, { recursive: true });
  }

  const { type, format, quality, outputDir, embedMetadata, embedThumbnail } = finalOptions;

  // Build CLI arguments
  const args = [
    '--no-warnings',
    '--newline',
    '--ignore-config',
    '--no-check-certificate',
    '--format-sort', 'res,quality'
  ];

  if (type === 'audio') {
    args.push('--extract-audio', '--audio-format', format);
    // Quality settings for audio
    if (quality !== 'best') {
      if (['320', '256', '192', '128', '96'].includes(quality.toString())) {
        args.push('--audio-quality', `${quality}K`);
      } else if (typeof quality === 'number' && quality >= 0 && quality <= 9) {
         args.push('--audio-quality', quality.toString());
      }
    } else {
      args.push('-f', 'bestaudio/best');
      args.push('--audio-quality', '0'); // Best
    }
  } else if (type === 'video') {
    // Quality settings for video
    let formatString = 'bestvideo+bestaudio/best';
    
    // Map nice quality names to yt-dlp height filters
    const heightMap = {
      '4k': 2160,
      '2k': 1440,
      '1080p': 1080,
      '720p': 720,
      '480p': 480,
      '360p': 360
    };
    
    if (quality && quality !== 'best') {
      const targetHeight = heightMap[quality.toLowerCase()] || parseInt(quality);
      if (targetHeight) {
         formatString = `bestvideo[height<=${targetHeight}]+bestaudio/best[height<=${targetHeight}]/best`;
      }
    }
    
    args.push('-f', formatString);
    if (format === 'mp4' || format === 'mkv') {
       args.push('--merge-output-format', format);
    }
  }

  // Metadata
  if (embedMetadata) {
    args.push('--add-metadata');
  }

  if (embedThumbnail) {
    args.push('--embed-thumbnail');
  }

  // Output template
  const outputTemplate = path.join(outputDir, '%(title)s [%(id)s].%(ext)s');
  args.push('-o', outputTemplate);

  args.push(url);

  PluginSystem.emit('onDownloadStart', { url, options: finalOptions });

  return new Promise((resolve, reject) => {
    let processError = '';
    let lastProgress = 0;
    
    // Use python module to run yt_dlp to avoid using the globally outdated yt-dlp executable
    // And removed Android player_client config which throttled video downloads to 360p
    const ytdlp = spawn('python', ['-m', 'yt_dlp', ...args]);

    ytdlp.stdout.on('data', (data) => {
      const output = data.toString();
      
      // Parse progress if needed (simple rough parsing)
      const progressMatch = output.match(/(\d+\.?\d*)%/);
      if (progressMatch) {
         const progress = parseFloat(progressMatch[1]);
         if (progress - lastProgress > 5 || progress === 100) {
            PluginSystem.emit('onDownloadProgress', { url, progress });
            lastProgress = progress;
         }
      }
    });

    ytdlp.stderr.on('data', (data) => {
      processError += data.toString();
    });

    ytdlp.on('close', (code) => {
      if (code === 0) {
        PluginSystem.emit('onDownloadComplete', { url, options: finalOptions, success: true });
        resolve({ success: true, url, format, outputDir, type });
      } else {
        PluginSystem.emit('onDownloadComplete', { url, options: finalOptions, success: false, error: processError });
        reject(new Error(`Download failed with code ${code}: ${processError}`));
      }
    });
    
    ytdlp.on('error', (err) => {
       PluginSystem.emit('onDownloadComplete', { url, options: finalOptions, success: false, error: err.message });
       reject(err);
    });
  });
};

const downloadAudio = (url, options = {}) => downloadMedia(url, { ...options, type: 'audio' });
const downloadVideo = (url, options = {}) => downloadMedia(url, { ...options, type: 'video' });

module.exports = {
  downloadMedia,
  downloadAudio,
  downloadVideo,
  isValidUrl
};
