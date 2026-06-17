const fs = require('fs');

async function analyze() {
  console.log('Fetching index.m3u...');
  const m3uRes = await fetch('https://iptv-org.github.io/iptv/index.m3u');
  const m3uText = await m3uRes.text();

  console.log('Fetching channels.json...');
  const apiRes = await fetch('https://iptv-org.github.io/api/channels.json');
  const channelsData = await apiRes.json(); // Array of channel objects

  // Create a Set of tvg-ids that are Tamil
  const tamilTvgIds = new Set();
  channelsData.forEach(c => {
    // languages is usually an array of language codes, Tamil is 'tam'
    if (c.languages && c.languages.includes('tam')) {
      tamilTvgIds.add(c.id);
    }
  });

  console.log(`Found ${tamilTvgIds.size} Tamil tvg-ids in the API.`);

  // Now parse index.m3u and find matches
  const lines = m3uText.split('\n');
  const tamilChannelsInM3u = [];

  for (let line of lines) {
    if (line.startsWith('#EXTINF:')) {
      const idMatch = line.match(/tvg-id="([^"]+)"/);
      const nameMatch = line.substring(line.lastIndexOf(',') + 1).trim();
      
      if (idMatch && tamilTvgIds.has(idMatch[1])) {
        tamilChannelsInM3u.push({
          id: idMatch[1],
          name: nameMatch
        });
      } else if (nameMatch.toLowerCase().includes('tamil')) {
        // Also catch ones that literally say "Tamil" but might not be tagged properly in API
        tamilChannelsInM3u.push({
          id: idMatch ? idMatch[1] : 'Unknown',
          name: nameMatch
        });
      }
    }
  }

  // Deduplicate by name
  const uniqueNames = [...new Set(tamilChannelsInM3u.map(c => c.name))];
  
  console.log(`Found ${uniqueNames.length} Tamil channels in index.m3u!`);
  console.log(JSON.stringify(uniqueNames, null, 2));
  
  fs.writeFileSync('tamil_channels.json', JSON.stringify(uniqueNames, null, 2));
}

analyze().catch(console.error);
