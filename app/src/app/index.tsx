import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import { Channel } from '../utils/m3uParser';
import { ChannelCard } from '../components/ChannelCard';
import { BottomNavbar } from '../components/BottomNavbar';
import { Hero } from '../components/Hero';
import { SymbolView } from 'expo-symbols';
import { isTamilChannel, getTier } from '../utils/tamilLogic';

// Component for a single horizontal row of channels
const CategoryRow = React.memo(({ category, channels, onChannelPress }: { category: string, channels: Channel[], onChannelPress: (c: Channel) => void }) => {
  const [renderCount, setRenderCount] = useState(10);

  const displayedChannels = useMemo(() => {
    return channels.slice(0, renderCount);
  }, [channels, renderCount]);

  const handleEndReached = useCallback(() => {
    if (renderCount < channels.length) {
      // Use a slight timeout so the UI has time to render the loading spinner
      // before the main thread gets blocked rendering the next batch of complex cards.
      setTimeout(() => {
        setRenderCount(prev => Math.min(prev + 15, channels.length));
      }, 50);
    }
  }, [renderCount, channels.length]);

  return (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{category}</Text>
      <FlatList
        horizontal
        data={displayedChannels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChannelCard channel={item} onPress={onChannelPress} />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContent}
        initialNumToRender={10} 
        maxToRenderPerBatch={10}
        windowSize={5}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => {
          if (renderCount < channels.length) {
            return (
              <View style={styles.skeletonCard}>
                <View style={styles.skeletonImage}>
                  <ActivityIndicator size="small" color="#8F98B0" />
                </View>
              </View>
            );
          }
          return null;
        }}
      />
    </View>
  );
});

export default function HomeScreen() {
  const { channels, apiTamilTvgIds, favorites, isLoading, error, fetchChannels } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'tv' | 'all' | 'favorites'>('tv');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Initial fetch if we don't have channels
    if (channels.length === 0 && !isLoading && !error) {
      fetchChannels();
    }
  }, [channels.length, isLoading, error, fetchChannels]);

  // Group channels and filter by search
  const groupedData = useMemo(() => {
    if (!channels || channels.length === 0) return [];

    let filtered = channels;
    const hasSearchQuery = searchQuery.length >= 3;
    
    if (activeTab === 'favorites') {
      filtered = channels.filter(c => favorites.includes(c.id));
      if (hasSearchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(lowerQuery) || 
          c.category.toLowerCase().includes(lowerQuery)
        );
      }
    } else {
      if (hasSearchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = channels.filter(c => 
          c.name.toLowerCase().includes(lowerQuery) || 
          c.category.toLowerCase().includes(lowerQuery)
        );
      } else if (activeTab === 'all') {
        filtered = channels; // Show all channels!
      } else {
        filtered = channels.filter(c => isTamilChannel(c, apiTamilTvgIds));
      }
    }

    const groups: Record<string, Channel[]> = {};
    const tamilChannels: Channel[] = [];

    for (const channel of filtered) {
      if (!groups[channel.category]) {
        groups[channel.category] = [];
      }
      groups[channel.category].push(channel);
      
      if (isTamilChannel(channel, apiTamilTvgIds)) {
        tamilChannels.push(channel);
      }
    }

    // Convert to array and sort categories alphabetically
    const sortedGroups = Object.entries(groups)
      .map(([category, items]) => ({ category, items }))
      .sort((a, b) => a.category.localeCompare(b.category));
      
    if (tamilChannels.length > 0) {
      const uniqueTamilChannels = Array.from(new Map(tamilChannels.map(c => [c.id, c])).values());
      
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

  }, [channels, searchQuery, apiTamilTvgIds, activeTab, favorites]);

  const router = useRouter();

  const handleChannelPress = useCallback((channel: Channel) => {
    // Phase 3: Navigate to video player
    console.log('Pressed channel:', channel.name);
    router.push({
      pathname: '/player',
      params: { url: encodeURIComponent(channel.url), name: channel.name }
    });
  }, [router]);

  const renderCategoryRow = useCallback(({ item }: { item: { category: string, items: Channel[] } }) => {
    return (
      <CategoryRow 
        category={item.category} 
        channels={item.items} 
        onChannelPress={handleChannelPress} 
      />
    );
  }, [handleChannelPress]);

  if (isLoading && channels.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00E5FF" />
        <Text style={styles.loadingText}>Loading 12k+ Channels...</Text>
      </View>
    );
  }

  if (error && channels.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load playlist:</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Search Header */}
      <View style={[styles.header, { top: insets.top }]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search channels or categories..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
        <Pressable 
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <SymbolView name="gearshape.fill" size={20} tintColor="#E1E6F0" />
        </Pressable>
      </View>

      {/* Main List */}
      <FlatList
        data={groupedData}
        keyExtractor={(item) => item.category}
        renderItem={renderCategoryRow}
        contentContainerStyle={styles.verticalListContent}
        initialNumToRender={5} // Keep low to prevent UI freeze on initial load
        maxToRenderPerBatch={3}
        windowSize={3}
        removeClippedSubviews={Platform.OS === 'android'} // Memory optimization
        ListHeaderComponent={<Hero channels={channels} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'favorites' 
                ? "You haven't favorited any channels yet." 
                : "No channels found."}
            </Text>
          </View>
        )}
      />

      {/* Floating Bottom Navbar */}
      <BottomNavbar activeTab={activeTab} onTabChange={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1014', // Hotstar background
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0F1014',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#E1E6F0',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF4C4C',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 32,
    marginTop: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#E1E6F0',
    fontSize: 15,
    borderWidth: 0,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
      } as any,
    }),
  },
  settingsButton: {
    marginLeft: 12,
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
      } as any,
    }),
  },
  verticalListContent: {
    paddingTop: 80, // Push content below the absolute search header
    paddingBottom: 100, // Padding for floating navbar
  },
  categoryContainer: {
    marginTop: 20,
    marginBottom: 8,
  },
  categoryTitle: {
    color: '#E1E6F0',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 20,
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  horizontalListContent: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8F98B0',
    fontSize: 16,
  },
  skeletonCard: {
    width: 160,
    marginRight: 16,
  },
  skeletonImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#16181F',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
