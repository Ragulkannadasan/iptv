const PLAYLIST_URL = 'https://iptv-org.github.io/iptv/index.m3u';

// State
let allChannels = [];
let groupedChannels = []; // Array of { category, items }
let filteredGroups = [];
let hlsInstance = null;

// DOM Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorTextEl = document.getElementById('error-text');
const containerEl = document.getElementById('categories-container');
const searchInput = document.getElementById('search-input');

const videoModal = document.getElementById('video-modal');
const videoPlayer = document.getElementById('video-player');
const modalTitle = document.getElementById('modal-title');
const closeModalBtn = document.getElementById('close-modal');
const videoError = document.getElementById('video-error');

// Parser
function parseM3U(rawText) {
  const channels = [];
  const lines = rawText.split('\n');
  let currentChannel = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line === '#EXTM3U') continue;

    if (line.startsWith('#EXTINF:')) {
      currentChannel = {};
      
      const idMatch = line.match(/tvg-id="([^"]+)"/);
      currentChannel.tvgId = idMatch ? idMatch[1] : '';

      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      currentChannel.logo = logoMatch ? logoMatch[1] : '';

      const groupMatch = line.match(/group-title="([^"]+)"/);
      currentChannel.category = groupMatch ? groupMatch[1] : 'Uncategorized';

      const commaIndex = line.lastIndexOf(',');
      if (commaIndex !== -1) {
        currentChannel.name = line.substring(commaIndex + 1).trim();
      } else {
        currentChannel.name = 'Unknown Channel';
      }
    } else if (!line.startsWith('#') && currentChannel) {
      currentChannel.url = line;
      currentChannel.id = `${currentChannel.name}-${currentChannel.url}`;
      channels.push(currentChannel);
      currentChannel = null;
    }
  }
  return channels;
}

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

let apiTamilTvgIds = new Set();

function isTamilChannel(channel) {
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

// Grouping
function groupChannels(channelsArray) {
  const groups = {};
  const tamilChannels = [];

  for (const channel of channelsArray) {
    if (!groups[channel.category]) groups[channel.category] = [];
    groups[channel.category].push(channel);

    if (isTamilChannel(channel)) {
      tamilChannels.push(channel);
    }
  }

  const sortedGroups = Object.entries(groups)
    .map(([category, items]) => ({ category, items }))
    .sort((a, b) => a.category.localeCompare(b.category));

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

  function getTier(name) {
    const lowerName = name.toLowerCase();
    for (let i = 0; i < popularityTiers.length; i++) {
      if (popularityTiers[i].some(kw => lowerName.includes(kw) || lowerName === kw)) {
        return i;
      }
    }
    return 99; // Default tier
  }

  // Prepend Tamil channels as the first category row if any exist
  if (tamilChannels.length > 0) {
    const uniqueTamilChannels = Array.from(new Set(tamilChannels.map(c => c.id)))
      .map(id => tamilChannels.find(c => c.id === id));

    // Sort by popularity!
    uniqueTamilChannels.sort((a, b) => {
      const tierA = getTier(a.name);
      const tierB = getTier(b.name);
      if (tierA !== tierB) {
        return tierA - tierB;
      }
      return a.name.localeCompare(b.name);
    });

    sortedGroups.unshift({
      category: '⭐ Tamil Channels',
      items: uniqueTamilChannels
    });
  }

  return sortedGroups;
}

// Fetch
async function loadPlaylist() {
  try {
    loadingEl.querySelector('h2').textContent = 'Analyzing 12,000+ Channels...';

    // Fetch playlist and API data concurrently for speed
    const [playlistRes, apiRes] = await Promise.all([
      fetch(PLAYLIST_URL),
      fetch('https://iptv-org.github.io/api/channels.json').catch(() => null)
    ]);

    if (!playlistRes.ok) throw new Error('Failed to fetch playlist');
    const text = await playlistRes.text();
    
    if (apiRes && apiRes.ok) {
      const channelsData = await apiRes.json();
      channelsData.forEach(c => {
        if (c.languages && c.languages.includes('tam')) {
          apiTamilTvgIds.add(c.id);
        }
      });
    }
    
    allChannels = parseM3U(text);
    applyFilters();
    
    loadingEl.classList.add('hidden');
  } catch (err) {
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
    errorTextEl.textContent = err.message;
    console.error(err);
  }
}

// Rendering
function createChannelCard(channel) {
  const card = document.createElement('div');
  card.className = 'channel-card';
  card.onclick = () => openVideo(channel);

  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'card-image-wrapper';

  if (channel.logo) {
    const img = document.createElement('img');
    img.src = channel.logo;
    img.className = 'card-logo';
    img.loading = 'lazy'; // Native lazy loading
    img.onerror = () => {
      imgWrapper.innerHTML = `<div class="card-fallback">${channel.name.charAt(0).toUpperCase()}</div>`;
    };
    imgWrapper.appendChild(img);
  } else {
    imgWrapper.innerHTML = `<div class="card-fallback">${channel.name.charAt(0).toUpperCase()}</div>`;
  }

  const info = document.createElement('div');
  info.className = 'card-info';
  const name = document.createElement('div');
  name.className = 'card-name';
  name.textContent = channel.name;
  info.appendChild(name);

  card.appendChild(imgWrapper);
  card.appendChild(info);
  return card;
}

function createCategoryRow(group) {
  const row = document.createElement('div');
  row.className = 'category-row';

  const title = document.createElement('h2');
  title.className = 'category-title';
  title.textContent = group.category;

  const scrollContainer = document.createElement('div');
  scrollContainer.className = 'horizontal-scroll';

  group.items.forEach(channel => {
    scrollContainer.appendChild(createChannelCard(channel));
  });

  row.appendChild(title);
  row.appendChild(scrollContainer);
  return row;
}

// Intersection Observer for Vertical Lazy Rendering
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const index = parseInt(entry.target.dataset.index);
      if (filteredGroups[index] && !entry.target.hasChildNodes()) {
        entry.target.appendChild(createCategoryRow(filteredGroups[index]));
      }
    }
  });
}, { rootMargin: '200px' });

function renderDOM() {
  containerEl.innerHTML = '';
  
  if (filteredGroups.length === 0) {
    containerEl.innerHTML = '<div class="center-message" style="height:20vh; color:#888;">No channels found.</div>';
    return;
  }

  filteredGroups.forEach((group, index) => {
    const placeholder = document.createElement('div');
    placeholder.className = 'category-placeholder';
    placeholder.dataset.index = index;
    placeholder.style.minHeight = '200px'; 
    
    if (index < 3) {
      placeholder.appendChild(createCategoryRow(group));
    } else {
      observer.observe(placeholder);
    }
    
    containerEl.appendChild(placeholder);
  });
}

// Filtering
function applyFilters() {
  const query = searchInput.value.toLowerCase();
  
  const filtered = allChannels.filter(c => {
    // If user is searching, show matching channels from all 12,000 channels
    if (query.length >= 3) {
      return c.name.toLowerCase().includes(query) || 
             c.category.toLowerCase().includes(query);
    }
    
    // If NO search query, ONLY show Tamil channels!
    return isTamilChannel(c);
  });

  filteredGroups = groupChannels(filtered);
  renderDOM();
}

searchInput.addEventListener('input', applyFilters);

// Video Player
function openVideo(channel) {
  modalTitle.textContent = channel.name;
  videoError.classList.add('hidden');
  videoModal.showModal();
  document.body.style.overflow = 'hidden';

  if (Hls.isSupported()) {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
    hlsInstance = new Hls({ maxBufferLength: 30 });
    hlsInstance.loadSource(channel.url);
    hlsInstance.attachMedia(videoPlayer);
    
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      videoPlayer.play().catch(e => console.log('Autoplay blocked:', e));
    });

    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hlsInstance.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hlsInstance.recoverMediaError();
            break;
          default:
            videoError.classList.remove('hidden');
            hlsInstance.destroy();
            break;
        }
      }
    });
  } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari
    videoPlayer.src = channel.url;
    videoPlayer.play().catch(e => console.log('Autoplay blocked:', e));
  } else {
    videoError.textContent = 'HLS is not supported in this browser.';
    videoError.classList.remove('hidden');
  }
}

function closeVideo() {
  videoModal.close();
  document.body.style.overflow = '';
  videoPlayer.pause();
  videoPlayer.removeAttribute('src');
  videoPlayer.load();
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
}

closeModalBtn.addEventListener('click', closeVideo);
videoModal.addEventListener('cancel', closeVideo);

// Click outside modal to close
videoModal.addEventListener('click', (e) => {
  const rect = videoModal.getBoundingClientRect();
  const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
    rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
  if (!isInDialog) {
    closeVideo();
  }
});

// Init
loadPlaylist();
