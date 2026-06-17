export const PLAYLIST_URL = 'https://iptv-org.github.io/iptv/index.m3u';
export const CHANNELS_API_URL = 'https://iptv-org.github.io/api/channels.json';

/**
 * Fetches the M3U playlist from the provided URL.
 * @param {string} url The URL to fetch the M3U playlist from. Defaults to iptv-org list.
 * @returns {Promise<string>} The raw M3U playlist as a string.
 */
export async function downloadPlaylist(url: string = PLAYLIST_URL): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error fetching M3U playlist:', error);
    throw error;
  }
}

/**
 * Fetches the channels.json API.
 * @returns {Promise<any[]>} Array of channel data from the API.
 */
export async function fetchChannelsApi(): Promise<any[]> {
  try {
    const response = await fetch(CHANNELS_API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch channels API: ${response.status} ${response.statusText}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Error fetching channels API:', error);
    throw error;
  }
}
