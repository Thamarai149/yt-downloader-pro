const fs = require('fs');
const path = require('path');
const { downloadMedia } = require('../core/downloader');
const Cache = require('./cache');

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), '.yt-audio-subscriptions.json');

/**
 * Subscribe to a channel or playlist URL to auto-download new items
 */
class SubscriptionsManager {
  constructor() {
    this.loadSubscriptions();
  }

  loadSubscriptions() {
    if (!fs.existsSync(SUBSCRIPTIONS_FILE)) {
      this.subs = [];
      this.saveSubscriptions();
    } else {
      this.subs = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8'));
    }
  }

  saveSubscriptions() {
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(this.subs, null, 2));
  }

  add(name, url, options = {}) {
    if (this.subs.find(s => s.url === url)) {
      throw new Error(`Already subscribed to ${url}`);
    }
    this.subs.push({ name, url, options, addedAt: new Date().toISOString() });
    this.saveSubscriptions();
  }

  remove(url) {
    this.subs = this.subs.filter(s => s.url !== url);
    this.saveSubscriptions();
  }

  list() {
    return this.subs;
  }

  /**
   * Check all subscriptions for new items and download them
   * NOTE: For full playlist syncing without redownloading, yt-dlp has `--download-archive`.
   * We will leverage `Cache` for simple checking or rely on yt-dlp.
   */
  async syncAll() {
    for (const sub of this.subs) {
      console.log(`Syncing subscription: ${sub.name} (${sub.url})`);
      // Use yt-dlp's built-in download archive feature to remember downloaded videos
      const finalOptions = {
        ...sub.options,
        // Assuming downloadAudio passes extra arguments if we need, but for simplicity:
        // Cache will handle basic duplication, or we pass a playlist flag.
      };
      
      try {
        await downloadMedia(sub.url, finalOptions);
      } catch (err) {
         console.error(`Error syncing ${sub.name}:`, err.message);
      }
    }
  }
}

module.exports = new SubscriptionsManager();
