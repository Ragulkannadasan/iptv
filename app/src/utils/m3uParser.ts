export interface Channel {
  id: string; // We'll generate a unique ID based on name/url
  tvgId: string;
  name: string;
  logo: string;
  category: string;
  url: string;
}

/**
 * Parses raw M3U text into an array of Channel objects.
 * Designed to be fast enough for 30,000+ lines.
 */
export function parseM3U(rawText: string): Channel[] {
  const channels: Channel[] = [];
  const lines = rawText.split('\n');
  
  let currentChannel: Partial<Channel> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines or the header
    if (!line || line === '#EXTM3U') {
      continue;
    }

    if (line.startsWith('#EXTINF:')) {
      currentChannel = {};
      
      // Extract tvg-id
      const idMatch = line.match(/tvg-id="([^"]+)"/);
      currentChannel.tvgId = idMatch ? idMatch[1] : '';

      // Extract tvg-logo
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      currentChannel.logo = logoMatch ? logoMatch[1] : '';

      // Extract group-title
      const groupMatch = line.match(/group-title="([^"]+)"/);
      currentChannel.category = groupMatch ? groupMatch[1] : 'Uncategorized';

      // Extract name (it's usually after the last comma)
      const commaIndex = line.lastIndexOf(',');
      if (commaIndex !== -1) {
        currentChannel.name = line.substring(commaIndex + 1).trim();
      } else {
        currentChannel.name = 'Unknown Channel';
      }
    } else if (!line.startsWith('#') && currentChannel) {
      // If it's not a comment, it's the URL for the previously parsed EXTINF
      currentChannel.url = line;
      currentChannel.id = `${currentChannel.name}-${currentChannel.url}`; // Simple unique ID
      
      channels.push(currentChannel as Channel);
      currentChannel = null; // Reset for the next channel
    }
  }

  return channels;
}
