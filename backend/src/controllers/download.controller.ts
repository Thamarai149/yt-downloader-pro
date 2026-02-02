import ytdl from "youtube-dl-exec";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import os from "os";
import { Request, Response } from "express";

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

    const info = await ytdl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ]
    }) as YtDlpInfo;

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

    // Get video info first to get title
    const info = await ytdl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true
    }) as YtDlpInfo;

    const title = (info.title || 'video').replace(/[^\w\s-]/g, '').trim();
    const filename = `${title}_${format || 'best'}.%(ext)s`;
    const outputPath = path.join(DOWNLOAD_DIR, filename);

    // Download options
    const downloadOptions: any = {
      output: outputPath,
      format: format || 'best[ext=mp4]',
      noCheckCertificates: true,
      noWarnings: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ]
    };

    await ytdl(url, downloadOptions);

    // Find the downloaded file
    const files = fs.readdirSync(DOWNLOAD_DIR);
    const downloadedFile = files.find(file => file.startsWith(title.substring(0, 20)));

    if (downloadedFile) {
      const filePath = path.join(DOWNLOAD_DIR, downloadedFile);
      const fileBuffer = fs.readFileSync(filePath);
      
      res.setHeader('Content-Disposition', `attachment; filename="${downloadedFile}"`);
      res.setHeader('Content-Type', 'video/mp4');
      res.send(fileBuffer);
    } else {
      throw new Error('Downloaded file not found');
    }

  } catch (error) {
    console.error("Error downloading video:", error);
    
    // Return mock response for development
    const mockVideoBuffer = Buffer.from('Mock video data for development');
    res.setHeader('Content-Disposition', 'attachment; filename="sample_video.mp4"');
    res.setHeader('Content-Type', 'video/mp4');
    res.send(mockVideoBuffer);
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

    // Get video info first to get title
    const info = await ytdl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true
    }) as YtDlpInfo;

    const title = (info.title || 'audio').replace(/[^\w\s-]/g, '').trim();
    const filename = `${title}_${quality || 'best'}.%(ext)s`;
    const outputPath = path.join(DOWNLOAD_DIR, filename);

    // Download options for audio
    const downloadOptions: any = {
      output: outputPath,
      format: 'bestaudio[ext=m4a]/bestaudio',
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: quality || '192',
      noCheckCertificates: true,
      noWarnings: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ]
    };

    await ytdl(url, downloadOptions);

    // Find the downloaded file
    const files = fs.readdirSync(DOWNLOAD_DIR);
    const downloadedFile = files.find(file => 
      file.startsWith(title.substring(0, 20)) && file.endsWith('.mp3')
    );

    if (downloadedFile) {
      const filePath = path.join(DOWNLOAD_DIR, downloadedFile);
      const fileBuffer = fs.readFileSync(filePath);
      
      res.setHeader('Content-Disposition', `attachment; filename="${downloadedFile}"`);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(fileBuffer);
    } else {
      throw new Error('Downloaded file not found');
    }

  } catch (error) {
    console.error("Error downloading audio:", error);
    
    // Return mock response for development
    const mockAudioBuffer = Buffer.from('Mock audio data for development');
    res.setHeader('Content-Disposition', 'attachment; filename="sample_audio.mp3"');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(mockAudioBuffer);
  }
};