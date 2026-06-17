const fs = require('fs');

async function sortPopularityWise() {
  console.log('Fetching language API to ensure perfect accuracy...');
  let apiTamilTvgIds = new Set();
  try {
    const apiRes = await fetch('https://iptv-org.github.io/api/channels.json');
    const channelsData = await apiRes.json();
    channelsData.forEach(c => {
      if (c.languages && c.languages.includes('tam')) {
        apiTamilTvgIds.add(c.id);
      }
    });
  } catch (e) {
    console.error('Failed to fetch API', e);
  }

  const allChannels = JSON.parse(fs.readFileSync('all_channels.json', 'utf8'));

  // Very strict keywords to avoid false positives like KTV.kr
  const tamilKeywords = [
    'tamil', 'chutti', 'sun tv', 'sun music', 'sun news', 'sun life',
    'star vijay', 'vijay tv', 'vijay super', 'vijay takkar', 
    'jaya tv', 'jaya max', 'jaya plus', 'j movie', 'jaya',
    'kalaignar', 'isai aruvi', 'sirippoli', 'seithigal', 'murasu', 'chithiram',
    'zee tamil', 'zee thirai', 'zee',
    'raj tv', 'raj musix', 'raj digital', 'raj news', 'raj movies',
    'polimer', 'puthiya thalaimurai', 'thanthi tv', 'news7', 'news 7', 'news18', 
    'vasanth tv', 'mega tv', 'makkal tv', 'captain tv', 'peppers tv', 'adithya tv',
    'sathiyam tv', 'dd podhigai', 'win tv', 'velicham', 'vendhar tv', 'lotus news', 
    'isaiaruvi', 'angel tv', 'aastha', 'captain news', 'malai murasu', 'deepam tv', 
    'dan tamil oli', 'athavan tv', 'madha tv', 'sahana tv', 'ss music', 'imayam tv', 
    'nambikkai tv', 'moon tv', 'captain music', 'makkal seithi', 'arul tv', 'shalom tv', 
    'goodness tv', 'blessing tv', 'vedic tv', 'svbc', 'sankara tv', 'sai tv', 'om sakthi tv', 
    'bakthi tv', 'ibc bakthi', 'captain movies', 'south india cinema', 'kollywood', 
    'cine hits', 'vasantham', 'mediacorp'
  ];

  const tamilChannels = [];
  const seenUrls = new Set();

  for (const channel of allChannels) {
    const lowerName = channel.name.toLowerCase();
    
    // Exact KTV match to prevent false positives like KTV.kr or KTVU
    const isKTV = lowerName === 'k tv' || lowerName === 'ktv' || lowerName.includes('ktv (');
    const isChutti = lowerName.includes('chutti');
    
    // Avoid false positives like "Zee TV" matching the generic "zee" keyword
    const isZee = lowerName === 'zee' || lowerName.startsWith('zee ') || lowerName.includes(' zee ');
    const isJaya = lowerName === 'jaya' || lowerName.startsWith('jaya ') || lowerName.includes(' jaya ');
    
    const isTamilKeyword = tamilKeywords.some(kw => {
        if (kw === 'zee') return isZee;
        if (kw === 'jaya') return isJaya;
        return lowerName.includes(kw);
    });
    
    if (apiTamilTvgIds.has(channel.id) || isTamilKeyword || isKTV || isChutti) {
      if (!seenUrls.has(channel.url)) {
        tamilChannels.push(channel);
        seenUrls.add(channel.url);
      }
    }
  }

  // Popularity Tiers (lower index = more popular)
  const popularityTiers = [
    // Top Entertainment
    ['sun tv', 'star vijay', 'zee tamil', 'kalaignar tv', 'jaya tv', 'colors tamil', 'raj tv', 'polimer tv', 'vendhar tv', 'captain tv', 'k tv', 'ktv'],
    // Top News
    ['news18 tamil', 'puthiya thalaimurai', 'thanthi tv', 'news7 tamil', 'polimer news', 'kalaignar seithigal', 'raj news', 'sathiyam tv', 'tamil janam', 'lotus news'],
    // Entertainment & Music & Kids
    ['sun news', 'makkal tv', 'sirippoli', 'adithya tv', 'sun music', 'isaiaruvi', 'raj musix', 'jaya plus', 'jaya max', 'sun life', 'chutti tv', 'zee thirai', 'colors tamil hd'],
    // Specialized & Diaspora
    ['travelxp tamil', 'angel tv', 'aastha tamil', 'captain news', 'vasanth tv', 'mega tv', 'murasu tv', 'malai murasu', 'tamilan tv', 'tamil vision', 'ibc tamil', 'deepam tv', 'dan tamil', 'athavan tv', 'tamil oli', 'madha tv'],
    // More Music & Regional
    ['peppers tv', 'sahana tv', 'ss music', 'velicham tv', 'imayam tv', 'nambikkai tv', 'win tv', 'vaanavil tv', 'moon tv', 'captain music', 'raj digital', 'kalaignar murasu', 'seithigal tv', 'dd tamil', 'dd podhigai'],
    // Movies & Devotional
    ['makkal seithi', 'arul tv', 'shalom tv', 'goodness tv', 'blessing tv', 'vedic tv', 'svbc tamil', 'sankara tv', 'sai tv', 'om sakthi tv', 'bakthi tv', 'captain movies', 'raj movies', 'kollywood', 'cine hits']
  ];

  function getTier(name) {
    const lowerName = name.toLowerCase();
    for (let i = 0; i < popularityTiers.length; i++) {
      if (popularityTiers[i].some(kw => lowerName.includes(kw) || lowerName === kw)) {
        return i;
      }
    }
    return 99; // Default tier
  }

  tamilChannels.sort((a, b) => {
    const tierA = getTier(a.name);
    const tierB = getTier(b.name);
    if (tierA !== tierB) {
      return tierA - tierB;
    }
    return a.name.localeCompare(b.name);
  });

  fs.writeFileSync('tamil_channels.json', JSON.stringify(tamilChannels, null, 2));
  console.log(`Saved ${tamilChannels.length} popularity-sorted Tamil channels to tamil_channels.json`);
}

sortPopularityWise().catch(console.error);
