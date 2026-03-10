/**
 * Configuration manager for yt-audio-pro
 */
class ConfigManager {
  constructor() {
    this.profiles = {
      default: {
        format: 'mp3',
        quality: 'best',
        embedMetadata: true,
        embedThumbnail: true
      },
      podcast: {
        format: 'mp3',
        quality: '128', // Lower bitrate for spoken word
        embedMetadata: true,
        embedThumbnail: true
      },
      'music-hd': {
        format: 'flac', // Lossless
        quality: 'best',
        embedMetadata: true,
        embedThumbnail: true
      },
      'voice-only': {
        format: 'mp3',
        quality: '96', // Very low bitrate
        embedMetadata: false,
        embedThumbnail: false
      }
    };
  }

  /**
   * Get settings for a specific profile
   */
  getProfile(name) {
    if (this.profiles[name]) {
      return this.profiles[name];
    }
    console.warn(`Profile '${name}' not found. Falling back to default.`);
    return this.profiles.default;
  }

  /**
   * Add or override a custom profile
   */
  setProfile(name, settings) {
    this.profiles[name] = { ...this.profiles.default, ...settings };
  }
}

module.exports = new ConfigManager();
