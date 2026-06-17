const fs = require('fs');

async function fetchTamilChannels() {
  console.log('Fetching tam.m3u from iptv-org...');
  // This playlist contains the canonical list of Tamil channels
  const response = await fetch('https://iptv-org.github.io/iptv/languages/tam.m3u');
  const text = await response.text();

  const channels = [];
  const lines = text.split('\n');
  let currentChannel = null;

  for (let line of lines) {
    line = line.trim();
    if (!line || line === '#EXTM3U') continue;

    if (line.startsWith('#EXTINF:')) {
      currentChannel = {};
      
      const idMatch = line.match(/tvg-id="([^"]+)"/);
      currentChannel.id = idMatch ? idMatch[1] : '';

      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      currentChannel.logo = logoMatch ? logoMatch[1] : '';

      const groupMatch = line.match(/group-title="([^"]+)"/);
      currentChannel.category = groupMatch ? groupMatch[1] : 'Undefined';

      const nameMatch = line.substring(line.lastIndexOf(',') + 1).trim();
      currentChannel.name = nameMatch;
    } else if (!line.startsWith('#') && currentChannel) {
      currentChannel.url = line;
      channels.push(currentChannel);
      currentChannel = null;
    }
  }

  console.log(`Successfully parsed ${channels.length} Tamil channels.`);
  
  // Save to json
  fs.writeFileSync('tamil_channels.json', JSON.stringify(channels, null, 2));
  console.log('Saved to tamil_channels.json');
}

fetchTamilChannels().catch(console.error);
