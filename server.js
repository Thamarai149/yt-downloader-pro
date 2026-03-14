const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const { downloadMedia, Queue, Config, Subscriptions, PluginSystem } = require('./src');

const app = express();
const PORT = process.env.PORT || 2006;

// Configure Multer for processing file uploads temporarily
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Output directory for merged files
const MERGED_DIR = path.join(__dirname, 'downloads', 'merged');
if (!fs.existsSync(MERGED_DIR)) fs.mkdirSync(MERGED_DIR, { recursive: true });

// Track active streams for direct downloads and merges
const activeStreams = new Map();

// Hook into the plugin system for SSE events
PluginSystem.register('onDownloadProgress', (data) => {
  const stream = activeStreams.get(data.url);
  if (stream) {
    stream.write(`data: ${JSON.stringify({ type: 'progress', data })}\n\n`);
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

/**
 * 1. Direct Download API with EventStreaming
 * POST /api/download
 */
app.post('/api/download', async (req, res) => {
  const { url, options } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // We start the download asynchronously and immediately return success
  // so the client can connect to the event stream.
  downloadMedia(url, options)
    .then(result => {
        // Send completion via SSE
        const stream = activeStreams.get(url);
        if (stream) {
           stream.write(`data: ${JSON.stringify({ type: 'complete', data: result })}\n\n`);
        }
    })
    .catch(error => {
        const stream = activeStreams.get(url);
        if (stream) {
           stream.write(`data: ${JSON.stringify({ type: 'error', data: error.message })}\n\n`);
        }
    });

  res.json({ message: 'Download initiated', url });
});

/**
 * GET /api/download/stream
 * Connects for Server-Sent Events (Progress tracking)
 */
app.get('/api/download/stream', (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('URL required');

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  activeStreams.set(url, res);

  req.on('close', () => {
    activeStreams.delete(url);
    res.end();
  });
});

/**
 * 2. Queue API
 */
app.get('/api/queue', (req, res) => {
  res.json({
    active: Queue.active,
    pending: Queue.queue,
    results: Queue.results,
    isPaused: Queue.isPaused
  });
});

app.post('/api/queue', (req, res) => {
  const { url, options } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  
  Queue.add(url, options);
  res.json({ message: 'Added to queue', queueLength: Queue.queue.length + Queue.active });
});

app.post('/api/queue/control', (req, res) => {
  const { action } = req.body; // 'pause', 'resume', 'clear'
  if (action === 'pause') Queue.pause();
  else if (action === 'resume') Queue.resume();
  else if (action === 'clear') Queue.clear();
  else return res.status(400).json({ error: 'Invalid action' });
  
  res.json({ status: 'success', action });
});

/**
 * 3. Subscriptions API
 */
app.get('/api/subscriptions', (req, res) => {
  res.json(Subscriptions.list());
});

app.post('/api/subscriptions', (req, res) => {
  const { name, url, options } = req.body;
  if (!url || !name) return res.status(400).json({ error: 'Name and URL required' });
  
  try {
    Subscriptions.add(name, url, options);
    res.json({ message: 'Subscription added', subscriptions: Subscriptions.list() });
  } catch(e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/subscriptions/sync', async (req, res) => {
  res.json({ message: 'Syncing started in background' });
  await Subscriptions.syncAll();
});

/**
 * 4. Merge API
 * POST /api/merge
 */
app.post('/api/merge', upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), (req, res) => {
  if (!req.files || !req.files.video || !req.files.audio) {
    return res.status(400).json({ error: 'Both video and audio files are required' });
  }

  const videoFile = req.files.video[0];
  const audioFile = req.files.audio[0];
  const jobId = Date.now().toString();

  // The final merged file will go to the configured directory
  const outputFilename = `merged-${jobId}.mkv`;
  const outputPath = path.join(MERGED_DIR, outputFilename);

  // Send an immediate response so the client can connect to SSE
  res.json({ message: 'Merge initiated', jobId });

  // Start FFmpeg process asynchronously
  ffmpeg()
    .input(videoFile.path)
    .input(audioFile.path)
    .outputOptions([
      '-c:v copy', // Copy video stream directly
      '-c:a aac',  // Convert audio to ACC for best mp4 compatibility
      '-strict experimental'
    ])
    .on('progress', (progress) => {
       const stream = activeStreams.get(jobId);
       if (stream && progress.percent) {
         stream.write(`data: ${JSON.stringify({ type: 'progress', data: { progress: Math.max(0, Math.min(progress.percent, 99)).toFixed(1) } })}\n\n`);
       }
    })
    .on('end', () => {
       // Clean up temporary uploads
       try { fs.unlinkSync(videoFile.path); fs.unlinkSync(audioFile.path); } catch(e) {}
       
       const stream = activeStreams.get(jobId);
       if (stream) {
         stream.write(`data: ${JSON.stringify({ type: 'complete', data: { outputDir: MERGED_DIR } })}\n\n`);
       }
    })
    .on('error', (err) => {
       // Clean up temporary uploads
       try { fs.unlinkSync(videoFile.path); fs.unlinkSync(audioFile.path); } catch(e) {}
       
       const stream = activeStreams.get(jobId);
       if (stream) {
         stream.write(`data: ${JSON.stringify({ type: 'error', data: err.message })}\n\n`);
       }
    })
    .save(outputPath);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
