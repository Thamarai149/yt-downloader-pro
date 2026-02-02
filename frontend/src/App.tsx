
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

interface VideoInfo {
  title: string;
  duration?: number;
  uploader?: string;
  view_count?: number;
  upload_date?: string;
  formats: Array<{
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

interface QualityOption {
  id: string;
  label: string;
  description: string;
  estimatedSize: string;
}

const videoQualities: QualityOption[] = [
  { id: '4k', label: '4K (2160p)', description: 'Ultra HD', estimatedSize: '~8-15 MB/min' },
  { id: '2k', label: '2K (1440p)', description: 'Quad HD', estimatedSize: '~4-8 MB/min' },
  { id: '1080p', label: '1080p', description: 'Full HD', estimatedSize: '~2-4 MB/min' },
  { id: '720p', label: '720p', description: 'HD Ready', estimatedSize: '~1-2 MB/min' },
  { id: '480p', label: '480p', description: 'Standard', estimatedSize: '~0.5-1 MB/min' },
  { id: '360p', label: '360p', description: 'Low Quality', estimatedSize: '~0.3-0.5 MB/min' },
];

const audioQualities: QualityOption[] = [
  { id: '320', label: '320 kbps', description: 'Highest Quality MP3', estimatedSize: '~2.5 MB/min' },
  { id: '256', label: '256 kbps', description: 'High Quality MP3', estimatedSize: '~2 MB/min' },
  { id: '192', label: '192 kbps', description: 'Good Quality MP3', estimatedSize: '~1.5 MB/min' },
  { id: '128', label: '128 kbps', description: 'Standard MP3', estimatedSize: '~1 MB/min' },
  { id: 'best', label: 'Best Available', description: 'Original Quality', estimatedSize: 'Variable' },
];

export default function App() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num?: number): string => {
    if (!num) return 'Unknown';
    return num.toLocaleString();
  };

  const getVideoInfo = async () => {
    if (!url.trim()) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setLoading(true);
    setError('');
    setVideoInfo(null);
    
    try {
      const response = await axios.post('/api/info', { url });
      setVideoInfo(response.data);
    } catch (err) {
      setError('Failed to get video information. Please check the URL and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isValidYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const getAvailableFormats = (targetHeight: number) => {
    if (!videoInfo?.formats) return [];
    
    return videoInfo.formats
      .filter(format => 
        format.ext === 'mp4' && 
        format.height && 
        Math.abs(format.height - targetHeight) <= 50
      )
      .sort((a, b) => Math.abs((a.height || 0) - targetHeight) - Math.abs((b.height || 0) - targetHeight));
  };

  const downloadVideo = async (quality: string) => {
    if (!videoInfo) return;

    setLoading(true);
    setDownloadProgress(0);
    
    try {
      let targetHeight: number;
      switch (quality) {
        case '4k': targetHeight = 2160; break;
        case '2k': targetHeight = 1440; break;
        case '1080p': targetHeight = 1080; break;
        case '720p': targetHeight = 720; break;
        case '480p': targetHeight = 480; break;
        case '360p': targetHeight = 360; break;
        default: targetHeight = 720;
      }

      const availableFormats = getAvailableFormats(targetHeight);
      if (availableFormats.length === 0) {
        setError(`${quality} quality not available for this video`);
        return;
      }

      const selectedFormat = availableFormats[0];
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const response = await axios.post('/api/video', { 
        url, 
        format: selectedFormat.format_id 
      }, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setDownloadProgress(progress);
          }
        }
      });
      
      clearInterval(progressInterval);
      setDownloadProgress(100);
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${videoInfo.title || 'video'}_${quality}.mp4`;
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      
      setTimeout(() => setDownloadProgress(0), 2000);
    } catch (err) {
      setError(`Failed to download ${quality} video`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadAudio = async (quality: string) => {
    if (!videoInfo) return;

    setLoading(true);
    setDownloadProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const response = await axios.post('/api/audio', { url }, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setDownloadProgress(progress);
          }
        }
      });
      
      clearInterval(progressInterval);
      setDownloadProgress(100);
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${videoInfo.title || 'audio'}_${quality}kbps.mp3`;
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      
      setTimeout(() => setDownloadProgress(0), 2000);
    } catch (err) {
      setError('Failed to download audio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      getVideoInfo();
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🎬 YT Downloader Pro</h1>
        <p>Download YouTube videos and audio in multiple qualities</p>
      </header>

      <main className="main-card">
        <div className="url-section">
          <div className="url-input-group">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Paste YouTube URL here... (e.g., https://youtube.com/watch?v=...)"
              className="url-input"
            />
            <button
              onClick={getVideoInfo}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  🔍 Get Info
                </>
              )}
            </button>
          </div>

          {downloadProgress > 0 && (
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {videoInfo && (
          <>
            <div className="video-info">
              <h2 className="video-title">📺 {videoInfo.title}</h2>
              
              <div className="video-meta">
                {videoInfo.uploader && videoInfo.uploader !== 'Unknown' && (
                  <div className="meta-item">
                    <span>👤</span>
                    <span>{videoInfo.uploader}</span>
                  </div>
                )}
                {videoInfo.duration && (
                  <div className="meta-item">
                    <span>⏱️</span>
                    <span>{formatDuration(videoInfo.duration)}</span>
                  </div>
                )}
                {videoInfo.view_count && (
                  <div className="meta-item">
                    <span>👀</span>
                    <span>{formatNumber(videoInfo.view_count)} views</span>
                  </div>
                )}
                {videoInfo.upload_date && videoInfo.upload_date !== 'Unknown' && (
                  <div className="meta-item">
                    <span>📅</span>
                    <span>{videoInfo.upload_date}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="download-sections">
              <div className="download-section">
                <h3 className="section-title">
                  🎥 Video Download
                </h3>
                <div className="quality-grid">
                  {videoQualities.map((quality) => {
                    const availableFormats = getAvailableFormats(
                      quality.id === '4k' ? 2160 :
                      quality.id === '2k' ? 1440 :
                      quality.id === '1080p' ? 1080 :
                      quality.id === '720p' ? 720 :
                      quality.id === '480p' ? 480 : 360
                    );
                    const isAvailable = availableFormats.length > 0;
                    
                    return (
                      <div
                        key={quality.id}
                        className={`quality-option ${!isAvailable ? 'disabled' : ''}`}
                        onClick={() => isAvailable && !loading && downloadVideo(quality.id)}
                        style={{ 
                          opacity: isAvailable ? 1 : 0.5,
                          cursor: isAvailable && !loading ? 'pointer' : 'not-allowed'
                        }}
                      >
                        <div className="quality-info">
                          <div className="quality-label">{quality.label}</div>
                          <div className="quality-details">{quality.description}</div>
                        </div>
                        <div className="quality-size">
                          {isAvailable ? quality.estimatedSize : 'Not Available'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="download-section">
                <h3 className="section-title">
                  🎵 Audio Download
                </h3>
                <div className="quality-grid">
                  {audioQualities.map((quality) => (
                    <div
                      key={quality.id}
                      className="quality-option"
                      onClick={() => !loading && downloadAudio(quality.id)}
                      style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                      <div className="quality-info">
                        <div className="quality-label">{quality.label}</div>
                        <div className="quality-details">{quality.description}</div>
                      </div>
                      <div className="quality-size">{quality.estimatedSize}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {!videoInfo && !loading && (
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎬</div>
              <h3 className="feature-title">Multiple Resolutions</h3>
              <p className="feature-description">
                Download videos in 4K, 2K, 1080p, 720p, 480p, or 360p quality
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎵</div>
              <h3 className="feature-title">High-Quality Audio</h3>
              <p className="feature-description">
                Extract audio in various bitrates from 128kbps to 320kbps MP3
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Fast Processing</h3>
              <p className="feature-description">
                Quick downloads with real-time progress tracking
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Safe & Secure</h3>
              <p className="feature-description">
                No registration required, completely private and secure
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>© 2024 YT Downloader Pro - Download responsibly and respect copyright laws</p>
      </footer>
    </div>
  );
}
