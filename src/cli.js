#!/usr/bin/env node

const { program } = require('commander');
const { downloadMedia } = require('./core/downloader');
const Queue = require('./core/queue');
const Config = require('./core/config');
const Subscriptions = require('./utils/subscriptions');
const packageJson = require('../package.json');

program
  .name('yt-audio-pro')
  .description('A modern YouTube audio downloader with queue, profiles, and subscription support')
  .version(packageJson.version);

/**
 * Handle basic download command
 */
program
  .command('download')
  .description('Download audio from a YouTube URL')
  .argument('<url>', 'YouTube video or playlist URL')
  .option('-t, --type <type>', 'Download type (audio, video)', 'audio')
  .option('-f, --format <format>', 'Output format (mp3, m4a, flac, wav for audio; mp4, mkv for video)')
  .option('-q, --quality <quality>', 'Quality or Resolution (best, 320, 1080p, 4k, etc)')
  .option('-o, --output <dir>', 'Output directory', 'C:\\Users\\THAMARAISELVAN\\Downloads\\ytdownloads')
  .option('-p, --profile <profile>', 'Use pre-configured profile (e.g. podcast, music-hd)')
  .option('--no-metadata', 'Disable ID3 metadata embedding')
  .option('--no-thumbnail', 'Disable thumbnail embedding')
  .action(async (url, options) => {
    console.log(`Starting download for: ${url}`);
    
    // Map negative options correctly
    const opts = {
      type: options.type,
      format: options.format || (options.type === 'video' ? 'mp4' : 'mp3'),
      quality: options.quality || 'best',
      outputDir: options.output,
      profile: options.profile,
      embedMetadata: options.metadata,
      embedThumbnail: options.thumbnail
    };

    try {
      const result = await downloadMedia(url, opts);
      console.log(`\n✅ Success! ${opts.type === 'video' ? 'Video' : 'Audio'} saved to ${result.outputDir}`);
    } catch (error) {
      console.error(`\n❌ Failed: ${error.message}`);
    }
  });

/**
 * Handle queue commands
 */
program
  .command('queue')
  .description('Add a URL to the background download queue')
  .argument('<url>', 'YouTube video or playlist URL')
  .option('-p, --profile <profile>', 'Use pre-configured profile')
  .action((url, options) => {
    Queue.on('added', (item) => console.log(`\n⏳ Added to queue: ${item.url}`));
    Queue.on('active', (item) => console.log(`\n⬇️ Downloading: ${item.url}`));
    Queue.on('completed', ({ item, result }) => console.log(`\n✅ Finished: ${item.url} -> ${result.outputDir}`));
    Queue.on('failed', ({ item, error }) => console.error(`\n❌ Failed: ${item.url} (${error})`));
    Queue.on('finished', (results) => {
      console.log('\n🏁 Queue processing complete!');
      console.log(`Total successful: ${results.successful.length}`);
      console.log(`Total failed: ${results.failed.length}`);
      process.exit(0);
    });

    Queue.add(url, { profile: options.profile });
  });

/**
 * Handle subscription commands
 */
program
  .command('subscribe')
  .description('Subscribe to a channel or playlist')
  .argument('<name>', 'Friendly name for the subscription')
  .argument('<url>', 'YouTube channel or playlist URL')
  .action((name, url) => {
    try {
      Subscriptions.add(name, url);
      console.log(`✅ Subscribed to ${name}: ${url}`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  });

program
  .command('sync')
  .description('Sync all subscriptions (download new items)')
  .action(async () => {
    console.log('🔄 Syncing all subscriptions...');
    await Subscriptions.syncAll();
    console.log('✅ Sync complete');
  });

program
  .command('list')
  .description('List all active subscriptions')
  .action(() => {
    const subs = Subscriptions.list();
    if (subs.length === 0) {
      console.log('No active subscriptions.');
    } else {
      console.log('Subscriptions:');
      subs.forEach((sub, i) => {
        console.log(`  ${i + 1}. ${sub.name} - ${sub.url}`);
      });
    }
  });

program.parse();
