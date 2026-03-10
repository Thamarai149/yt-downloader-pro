const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(process.cwd(), '.yt-audio-cache.json');

/**
 * Ensures cache file exists and loads it
 */
const loadCache = () => {
  if (!fs.existsSync(CACHE_FILE)) {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ downloadedUrls: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
};

/**
 * Check if URL has already been downloaded
 */
const hasDownloaded = (url) => {
  const cache = loadCache();
  return cache.downloadedUrls.includes(url);
};

/**
 * Mark URL as downloaded
 */
const markDownloaded = (url) => {
  if (hasDownloaded(url)) return;
  const cache = loadCache();
  cache.downloadedUrls.push(url);
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
};

module.exports = {
  hasDownloaded,
  markDownloaded,
  loadCache
};
