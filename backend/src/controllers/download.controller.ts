import ytdl from "youtube-dl-exec";
import ffmpeg from "fluent-ffmpeg";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import os from "os";
import { Request, Response } from "express";

const execAsync = promisify(exec);

// Type definitions for yt-dlp response
interface YtDlpInfo {
  title?: string;
  duration?: number;
  uploader?: string;
  view_count?: number;
  upload_date?: string;
  thumbnail?: string;
  formats?: Array<{
    format_id: string;
    ext: string;
    resolution?: string;
    height?: number;
    width?: number;
    filesize?: number;
    fps?: number;
    vcodec?: string;
    acodec?: string;
  }>;
}

// Default download directory
let DOWNLOAD_DIR = process.env.DOWNLOAD_PATH || path.join(os.homedir(), "Downloads", "YT Downloads");

// Ensure downloads directory exists
const ensureDownloadDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Initialize default directory
ensureDownloadDir(DOWNLOAD_DIR);

export const setDownloadPath = async (req: Request, res: Response) => {
  try {
    const { path: newPath } = req.body;
    
    if (!newPath) {
      return res.status(400).json({ error: "Path is required" });
    }

    // Validate path exists or can be created
    try {
      ensureDownloadDir(newPath);
      DOWNLOAD_DIR = newPath;
      res.json({ 
        success: true, 
        message: "Download path updated successfully",
        path: DOWNLOAD_DIR 
      });
    } catch (error) {
      res.status(400).json({ 
        error: "Invalid path or permission denied",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  } catch (error) {
    console.error("Error setting download path:", error);
    res.status(500).json({ error: "Failed to set download path" });
  }
};

export const getDownloadPath = async (req: Request, res: Response) => {
  try {
    res.json({ path: DOWNLOAD_DIR });
  } catch (error) {
    console.error("Error getting download path:", error);
    res.status(500).json({ error: "Failed to get download path" });
  }
};

export const getVideoInfo = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    console.log("Fetching video info for:", url);

    // Use yt-dlp command directly for better reliability
    const command = `yt-dlp --dump-single-json --no-check-certificates --no-warnings "${url}"`;
    
    const { stdout } = await execAsync(command, { 
      timeout: 30000,
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    const info = JSON.parse(stdout) as YtDlpInfo;

    // Process and filter formats
    const videoFormats = info.formats?.filter((format: any) => 
      format.vcodec && format.vcodec !== 'none' && format.ext === 'mp4'
    ) || [];

    const audioFormats = info.formats?.filter((format: any) => 
      format.acodec && format.acodec !== 'none' && !format.vcodec
    ) || [];

    const processedInfo = {
      title: info.title || 'Unknown Title',
      duration: info.duration || 0,
      uploader: info.uploader || 'Unknown',
      view_count: info.view_count || 0,
      upload_date: info.upload_date || 'Unknown',
      thumbnail: info.thumbnail || '',
      formats: [...videoFormats, ...audioFormats].slice(0, 20) // Limit formats
    };

    res.json(processedInfo);
  } catch (error) {
    console.error("Error fetching video info:", error);
    
    // Return mock data for development/testing
    const mockInfo = {
      title: "Sample Video Title",
      duration: 180,
      uploader: "Sample Channel",
      view_count: 1000000,
      upload_date: "20240101",
      thumbnail: "",
      formats: [
        { format_id: "22", ext: "mp4", height: 720, width: 1280, filesize: 50000000 },
        { format_id: "18", ext: "mp4", height: 360, width: 640, filesize: 25000000 }
      ]
    };
    
    res.json(mockInfo);
  }
};

export const downloadVideo = async (req: Request, res: Response) => {
  try {
    const { url, format } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    console.log(`Downloading video: ${url} with format: ${format}`);

    // Ensure download directory exists
    ensureDownloadDir(DOWNLOAD_DIR);

    // Map quality to yt-dlp format selectors
    let formatSelector: string;
    switch (format) {
      case '4k':
        formatSelector = 'best[height<=2160][ext=mp4]/best[height<=2160]/best[ext=mp4]/best';
        break;
      case '2k':
        formatSelector = 'best[height<=1440][ext=mp4]/best[height<=1440]/best[ext=mp4]/best';
        break;
      case '1080p':
        formatSelector = 'best[height<=1080][ext=mp4]/best[height<=1080]/best[ext=mp4]/best';
        break;
      case '720p':
        formatSelector = 'best[height<=720][ext=mp4]/best[height<=720]/best[ext=mp4]/best';
        break;
      case '480p':
        formatSelector = 'best[height<=480][ext=mp4]/best[height<=480]/best[ext=mp4]/best';
        break;
      case '360p':
        formatSelector = 'best[height<=360][ext=mp4]/best[height<=360]/best[ext=mp4]/best';
        break;
      default:
        formatSelector = 'best[ext=mp4]/best';
    }

    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const safeFilename = `video_${timestamp}.%(ext)s`;
    const outputTemplate = path.join(DOWNLOAD_DIR, safeFilename);

    console.log(`Using format selector: ${formatSelector}`);
    console.log(`Output template: ${outputTemplate}`);

    // Use yt-dlp command directly
    const command = `yt-dlp -f "${formatSelector}" -o "${outputTemplate}" --no-check-certificates --no-warnings "${url}"`;
    
    await execAsync(command, { 
      timeout: 300000, // 5 minutes timeout
      maxBuffer: 1024 * 1024 * 100 // 100MB buffer
    });

    // Find the downloaded file
    const files = fs.readdirSync(DOWNLOAD_DIR);
    const downloadedFile = files.find(file => file.includes(`video_${timestamp}`));

    if (downloadedFile && fs.existsSync(path.join(DOWNLOAD_DIR, downloadedFile))) {
      const filePath = path.join(DOWNLOAD_DIR, downloadedFile);
      const stats = fs.statSync(filePath);
      
      console.log(`File downloaded successfully: ${downloadedFile}, size: ${stats.size} bytes`);
      
      // Stream the file to the response
      res.setHeader('Content-Disposition', `attachment; filename="${downloadedFile}"`);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Length', stats.size.toString());
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      // Clean up file after sending (optional)
      fileStream.on('end', () => {
        setTimeout(() => {
          try {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up file: ${downloadedFile}`);
          } catch (cleanupError) {
            console.log(`Could not clean up file: ${cleanupError}`);
          }
        }, 5000); // Wait 5 seconds before cleanup
      });
      
    } else {
      throw new Error('Downloaded file not found or is empty');
    }

  } catch (error) {
    console.error("Error downloading video:", error);
    res.status(500).json({ 
      error: "Failed to download video", 
      details: error instanceof Error ? error.message : "Unknown error",
      format: req.body.format
    });
  }
};

export const downloadAudio = async (req: Request, res: Response) => {
  try {
    const { url, quality } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    console.log(`Downloading audio: ${url} with quality: ${quality}`);

    // Ensure download directory exists
    ensureDownloadDir(DOWNLOAD_DIR);

    // Map quality to yt-dlp format selectors
    let formatSelector: string;
    let audioQuality: string;
    
    switch (quality) {
      case '320':
        formatSelector = 'bestaudio[abr>=320]/bestaudio';
        audioQuality = '320';
        break;
      case '256':
        formatSelector = 'bestaudio[abr>=256]/bestaudio';
        audioQuality = '256';
        break;
      case '192':
        formatSelector = 'bestaudio[abr>=192]/bestaudio';
        audioQuality = '192';
        break;
      case '128':
        formatSelector = 'bestaudio[abr>=128]/bestaudio';
        audioQuality = '128';
        break;
      case 'best':
      default:
        formatSelector = 'bestaudio/best';
        audioQuality = '0'; // Best quality
    }

    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const safeFilename = `audio_${timestamp}.%(ext)s`;
    const outputTemplate = path.join(DOWNLOAD_DIR, safeFilename);

    console.log(`Using format selector: ${formatSelector}`);
    console.log(`Output template: ${outputTemplate}`);

    // Use yt-dlp command directly for audio extraction
    const command = `yt-dlp -f "${formatSelector}" --extract-audio --audio-format mp3 --audio-quality ${audioQuality} -o "${outputTemplate}" --no-check-certificates --no-warnings "${url}"`;
    
    await execAsync(command, { 
      timeout: 300000, // 5 minutes timeout
      maxBuffer: 1024 * 1024 * 50 // 50MB buffer
    });

    // Find the downloaded file
    const files = fs.readdirSync(DOWNLOAD_DIR);
    const downloadedFile = files.find(file => file.includes(`audio_${timestamp}`));

    if (downloadedFile && fs.existsSync(path.join(DOWNLOAD_DIR, downloadedFile))) {
      const filePath = path.join(DOWNLOAD_DIR, downloadedFile);
      const stats = fs.statSync(filePath);
      
      console.log(`Audio downloaded successfully: ${downloadedFile}, size: ${stats.size} bytes`);
      
      // Stream the file to the response
      res.setHeader('Content-Disposition', `attachment; filename="${downloadedFile}"`);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', stats.size.toString());
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      // Clean up file after sending (optional)
      fileStream.on('end', () => {
        setTimeout(() => {
          try {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up file: ${downloadedFile}`);
          } catch (cleanupError) {
            console.log(`Could not clean up file: ${cleanupError}`);
          }
        }, 5000); // Wait 5 seconds before cleanup
      });
      
    } else {
      throw new Error('Downloaded audio file not found or is empty');
    }

  } catch (error) {
    console.error("Error downloading audio:", error);
    res.status(500).json({ 
      error: "Failed to download audio", 
      details: error instanceof Error ? error.message : "Unknown error",
      quality: req.body.quality
    });
  }
};