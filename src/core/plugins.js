const EventEmitter = require('events');

/**
 * Plugin system for custom hooks (e.g., speech-to-text, tagging, upload)
 */
class PluginSystem extends EventEmitter {
  constructor() {
    super();
    this.plugins = [];
  }

  /**
   * Register a plugin or generic callback
   */
  register(event, callback) {
    this.on(event, callback);
    this.plugins.push({ event, callback });
  }

  /**
   * Log registered plugins (diagnostic)
   */
  listPlugins() {
    return this.plugins.map(p => p.event);
  }
}

// Singleton system
module.exports = new PluginSystem();
