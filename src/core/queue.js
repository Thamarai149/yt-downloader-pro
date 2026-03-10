const EventEmitter = require('events');
const { downloadMedia } = require('./downloader');

class DownloadQueue extends EventEmitter {
  constructor(concurrency = 2) {
    super();
    this.queue = [];
    this.active = 0;
    this.concurrency = concurrency;
    this.isPaused = false;
    this.results = {
      successful: [],
      failed: []
    };
  }

  /**
   * Add a URL to the download queue
   */
  add(url, options = {}) {
    this.queue.push({ url, options });
    this.emit('added', { url, options });
    this.process();
  }

  /**
   * Pause the queue processing
   */
  pause() {
    this.isPaused = true;
    this.emit('paused');
  }

  /**
   * Resume the queue processing
   */
  resume() {
    this.isPaused = false;
    this.emit('resumed');
    this.process();
  }

  /**
   * Clear the queue
   */
  clear() {
    this.queue = [];
    this.results = { successful: [], failed: [] };
    this.emit('cleared');
  }

  /**
   * Process the next item in the queue
   */
  async process() {
    if (this.isPaused) return;
    if (this.active >= this.concurrency) return;
    if (this.queue.length === 0) {
      if (this.active === 0) {
        this.emit('finished', this.results);
      }
      return;
    }

    const item = this.queue.shift();
    this.active++;
    
    this.emit('active', item);

    try {
      const result = await downloadMedia(item.url, item.options);
      this.results.successful.push({ ...item, result });
      this.emit('completed', { item, result });
    } catch (error) {
      this.results.failed.push({ ...item, error: error.message });
      this.emit('failed', { item, error: error.message });
      
      // Basic retry logic (hardcoded to 1 retry for now)
      if (!item.retried) {
        item.retried = true;
        this.emit('retry', item);
        this.queue.unshift(item); // Put back at the front
      }
    } finally {
      this.active--;
      this.process();
    }
  }
}

// Export as a singleton-like instance for basic use, or class for advanced use
const defaultQueue = new DownloadQueue();
defaultQueue.Queue = DownloadQueue; // Allow instantiation of custom queues

module.exports = defaultQueue;
