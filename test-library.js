const { downloadAudio, Queue, Config, PluginSystem, Subscriptions, Cache } = require('./src');

console.log('--- Testing yt-audio-pro Library ---');

console.log('\n1. Checking exports:');
console.log('downloadAudio:', typeof downloadAudio);
console.log('Queue:', typeof Queue.add);
console.log('Config:', typeof Config.getProfile);
console.log('PluginSystem:', typeof PluginSystem.register);
console.log('Subscriptions:', typeof Subscriptions.add);
console.log('Cache:', typeof Cache.hasDownloaded);

console.log('\n2. Testing config profiles:');
console.log('Podcast profile:', Config.getProfile('podcast'));

console.log('\nLibrary loaded successfully!');
