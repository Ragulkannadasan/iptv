import { Channel } from './m3uParser';

const tamilKeywords = [
  'tamil', 'chutti', 'sun tv', 'sun music', 'sun news', 'sun life',
  'star vijay', 'vijay tv', 'vijay super', 'vijay takkar', 
  'jaya tv', 'jaya max', 'jaya plus', 'j movie', 'jaya',
  'kalaignar', 'isai aruvi', 'sirippoli', 'seithigal', 'murasu', 'chithiram',
  'zee tamil', 'zee thirai', 'zee',
  'raj tv', 'raj musix', 'raj digital', 'raj news', 'raj movies',
  'polimer', 'puthiya thalaimurai', 'thanthi tv', 'news7', 'news 7', 'news18', 
  'vasanth tv', 'mega tv', 'makkal tv', 'captain tv', 'peppers tv', 'adithya tv',
  'sathiyam tv', 'dd podhigai', 'win tv', 'velicham', 'k tv', 'ktv',
  'vendhar tv', 'lotus news', 'isaiaruvi', 'angel tv', 'aastha', 'captain news', 
  'malai murasu', 'deepam tv', 'dan tamil oli', 'athavan tv', 'madha tv', 'sahana tv', 
  'ss music', 'imayam tv', 'nambikkai tv', 'moon tv', 'captain music', 'makkal seithi', 
  'arul tv', 'shalom tv', 'goodness tv', 'blessing tv', 'vedic tv', 'svbc', 'sankara tv', 
  'sai tv', 'om sakthi tv', 'bakthi tv', 'ibc bakthi', 'captain movies', 'south india cinema', 
  'kollywood', 'cine hits', 'vasantham', 'mediacorp'
];

export function isTamilChannel(channel: Channel, apiTamilTvgIds: Set<string>): boolean {
  const lowerName = channel.name.toLowerCase();
  
  // Strict matching for short acronyms
  const isKTV = lowerName === 'k tv' || lowerName === 'ktv' || lowerName.includes('ktv (');
  const isZee = lowerName === 'zee' || lowerName.startsWith('zee ') || lowerName.includes(' zee ');
  const isJaya = lowerName === 'jaya' || lowerName.startsWith('jaya ') || lowerName.includes(' jaya ');

  const isTamilKeyword = tamilKeywords.some(keyword => {
    if (keyword === 'ktv' || keyword === 'k tv') return isKTV;
    if (keyword === 'zee') return isZee;
    if (keyword === 'jaya') return isJaya;
    return lowerName.includes(keyword);
  });

  return apiTamilTvgIds.has(channel.tvgId) || isTamilKeyword;
}

// Popularity Tiers (lower index = more popular) based on User's exhaustive list
const popularityTiers = [
  // Top Entertainment
  ['sun tv', 'star vijay', 'zee tamil', 'kalaignar tv', 'jaya tv', 'colors tamil', 'raj tv', 'polimer tv', 'vendhar tv', 'captain tv'],
  // Top News
  ['news18 tamil', 'puthiya thalaimurai', 'thanthi tv', 'news7 tamil', 'polimer news', 'kalaignar seithigal', 'raj news', 'sathiyam tv', 'tamil janam', 'lotus news'],
  // Entertainment & Music & Kids
  ['sun news', 'makkal tv', 'sirippoli', 'adithya tv', 'sun music', 'isaiaruvi', 'raj musix', 'jaya plus', 'jaya max', 'k tv', 'ktv', 'sun life', 'chutti tv', 'zee thirai', 'colors tamil hd'],
  // Specialized & Diaspora
  ['travelxp tamil', 'angel tv', 'aastha tamil', 'captain news', 'vasanth tv', 'mega tv', 'murasu tv', 'malai murasu', 'tamilan tv', 'tamil vision', 'ibc tamil', 'deepam tv', 'dan tamil', 'athavan tv', 'tamil oli', 'madha tv'],
  // More Music & Regional
  ['peppers tv', 'sahana tv', 'ss music', 'velicham tv', 'imayam tv', 'nambikkai tv', 'win tv', 'vaanavil tv', 'moon tv', 'captain music', 'raj digital', 'kalaignar murasu', 'seithigal tv', 'dd tamil', 'dd podhigai'],
  // Movies & Devotional
  ['makkal seithi', 'arul tv', 'shalom tv', 'goodness tv', 'blessing tv', 'vedic tv', 'svbc tamil', 'sankara tv', 'sai tv', 'om sakthi tv', 'bakthi tv', 'captain movies', 'raj movies', 'kollywood', 'cine hits']
];

export function getTier(name: string): number {
  const lowerName = name.toLowerCase();
  for (let i = 0; i < popularityTiers.length; i++) {
    if (popularityTiers[i].some(kw => lowerName.includes(kw) || lowerName === kw)) {
      return i;
    }
  }
  return 99; // Default tier
}
