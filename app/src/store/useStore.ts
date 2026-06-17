import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Channel, parseM3U } from '../utils/m3uParser';
import { downloadPlaylist, fetchChannelsApi } from '../services/api';

interface AppState {
  channels: Channel[];
  apiTamilTvgIds: Set<string>;
  favorites: string[]; // Array of channel IDs
  playlistUrl: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchChannels: () => Promise<void>;
  toggleFavorite: (channelId: string) => void;
  clearFavorites: () => void;
  setPlaylistUrl: (url: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      channels: [],
      apiTamilTvgIds: new Set<string>(),
      favorites: [],
      playlistUrl: 'https://iptv-org.github.io/iptv/index.m3u',
      isLoading: false,
      error: null,

      fetchChannels: async () => {
        set({ isLoading: true, error: null });
        try {
          const { playlistUrl } = get();
          const [rawM3U, channelsApiData] = await Promise.all([
            downloadPlaylist(playlistUrl),
            fetchChannelsApi().catch(() => [])
          ]);
          
          const parsedChannels = parseM3U(rawM3U);
          
          const tamilIds = new Set<string>();
          if (channelsApiData && Array.isArray(channelsApiData)) {
            channelsApiData.forEach((c: any) => {
              if (c.languages && c.languages.includes('tam')) {
                tamilIds.add(c.id);
              }
            });
          }
          
          set({ channels: parsedChannels, apiTamilTvgIds: tamilIds, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch channels', isLoading: false });
        }
      },

      toggleFavorite: (channelId: string) => {
        const { favorites } = get();
        if (favorites.includes(channelId)) {
          set({ favorites: favorites.filter((id) => id !== channelId) });
        } else {
          set({ favorites: [...favorites, channelId] });
        }
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },

      setPlaylistUrl: (url: string) => {
        set({ playlistUrl: url, channels: [] }); // Clear channels to force re-fetch
        get().fetchChannels();
      }
    }),
    {
      name: 'iptv-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        favorites: state.favorites,
        playlistUrl: state.playlistUrl 
      }),
    }
  )
);
