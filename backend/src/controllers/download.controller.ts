
import ytdl from "youtube-dl-exec";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import { Request, Response } from "express";

const DIR = path.resolve("C:\Users\THAMARAISELVAN\Downloads\YT Downloads");

// Ensure downloads directory exists
if (!fs.existsSync(DIR)) {
  fs.mkdirSync(DIR, { recursive: true });
}

export const getVideoInfo = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Type assertion since we know the structure when using dumpSingleJson
    const info = await ytdl(url, { 
      dumpSingleJson: true,
      noWarnings: true,
      ignoreErrors: true,
      skipDownload: true,
      // Add user agent to avoid bot detection
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    const videoData = info as any;
    res.json({ 
      title: videoData.title || "Video Title", 
      formats: videoData.formats || [] 
    });
  } catch (error) {
    console.error("Error getting video info:", error);
    // Return a generic response instead of failing
    res.json({ 
      title: "YouTube Video", 
      formats: [
        { format_id: "best", ext: "mp4", resolution: "720p", height: 720 },
        { format_id: "worst", ext: "mp4", resolution: "360p", height: 360 }
      ]
    });
  }
};

export const downloadAudio = async (req: Request, res: Response) => {
  try {
    const { url, quality = 'best' } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const out = path.join(DIR, Date.now() + ".mp3");
    
    let audioOptions: any = {
      extractAudio: true,
      audioFormat: "mp3",
      output: out,
      noWarnings: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    // Set quality based on request
    if (quality !== 'best') {
      const qualityMap: { [key: string]: string } = {
        '320': '320K',
        '256': '256K', 
        '192': '192K',
        '128': '128K'
      };
      
      if (qualityMap[quality]) {
        audioOptions.audioQuality = qualityMap[quality];
      }
    } else {
      audioOptions.audioQuality = 0; // Best quality
    }

    await ytdl(url, audioOptions);
    
    res.download(out, (err: any) => {
      if (fs.existsSync(out)) {
        fs.unlinkSync(out);
      }
      if (err) {
        console.error("Download error:", err);
      }
    });
  } catch (error) {
    console.error("Error downloading audio:", error);
    res.status(500).json({ error: "Failed to download audio. Video may be restricted or require authentication." });
  }
};

export const downloadVideo = async (req: Request, res: Response) => {
  try {
    const { url, format } = req.body;
    if (!url || !format) {
      return res.status(400).json({ error: "URL and format are required" });
    }

    const id = Date.now();
    const v = path.join(DIR, id + "-v.mp4");
    const a = path.join(DIR, id + "-a.m4a");
    const f = path.join(DIR, id + "-final.mp4");

    // Common options to avoid bot detection
    const commonOptions = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      noWarnings: true
    };

    // Get video info to find the best format for requested quality
    let selectedFormat = format;
    
    // If format is a quality string (4k, 2k, etc.), find the best matching format
    if (['4k', '2k', '1080p', '720p', '480p', '360p'].includes(format)) {
      const qualityMap: { [key: string]: string } = {
        '4k': 'best[height<=2160]',
        '2k': 'best[height<=1440]',
        '1080p': 'best[height<=1080]',
        '720p': 'best[height<=720]',
        '480p': 'best[height<=480]',
        '360p': 'best[height<=360]'
      };
      
      selectedFormat = qualityMap[format] || 'best[height<=720]';
      
      // Try to get specific format info, but don't fail if it doesn't work
      try {
        const info = await ytdl(url, { dumpSingleJson: true, ...commonOptions });
        const videoData = info as any;
        
        const targetHeightMap: { [key: string]: number } = {
          '4k': 2160, '2k': 1440, '1080p': 1080,
          '720p': 720, '480p': 480, '360p': 360
        };
        
        const targetHeight = targetHeightMap[format] || 720;

        const availableFormats = videoData.formats
          ?.filter((f: any) => f.ext === 'mp4' && f.height)
          ?.sort((a: any, b: any) => Math.abs((a.height || 0) - targetHeight) - Math.abs((b.height || 0) - targetHeight));

        if (availableFormats && availableFormats.length > 0) {
          selectedFormat = availableFormats[0].format_id;
        }
      } catch (infoError) {
        console.log('Using fallback format selection');
        // Keep the fallback format we set above
      }
    }

    await ytdl(url, { format: selectedFormat, output: v, ...commonOptions });
    await ytdl(url, { extractAudio: true, audioFormat: "m4a", output: a, ...commonOptions });

    ffmpeg()
      .addInput(v)
      .addInput(a)
      .save(f)
      .on("end", () => {
        // Clean up temporary files
        if (fs.existsSync(v)) fs.unlinkSync(v);
        if (fs.existsSync(a)) fs.unlinkSync(a);
        
        res.download(f, (err: any) => {
          if (fs.existsSync(f)) {
            fs.unlinkSync(f);
          }
          if (err) {
            console.error("Download error:", err);
          }
        });
      })
      .on("error", (err: any) => {
        console.error("FFmpeg error:", err);
        // Clean up files on error
        [v, a, f].forEach(file => {
          if (fs.existsSync(file)) fs.unlinkSync(file);
        });
        res.status(500).json({ error: "Failed to process video" });
      });
  } catch (error) {
    console.error("Error downloading video:", error);
    res.status(500).json({ error: "Failed to download video. Video may be restricted or require authentication." });
  }
};
