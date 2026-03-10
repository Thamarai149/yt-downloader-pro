const { downloadMedia, downloadAudio, downloadVideo } = require('./core/downloader');
const Queue = require('./core/queue');
const Config = require('./core/config');
const PluginSystem = require('./core/plugins');
const Cache = require('./utils/cache');
const Subscriptions = require('./utils/subscriptions');

module.exports = {
  downloadMedia,
  downloadAudio,
  downloadVideo,
  Queue,
  Config,
  PluginSystem,
  Cache,
  Subscriptions
};
