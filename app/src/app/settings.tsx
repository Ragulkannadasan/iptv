import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useStore } from '../store/useStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { playlistUrl, setPlaylistUrl, clearFavorites, fetchChannels, channels } = useStore();
  const [inputUrl, setInputUrl] = useState(playlistUrl);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveUrl = () => {
    if (inputUrl.trim() !== '') {
      setPlaylistUrl(inputUrl.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const handleForceRefresh = () => {
    fetchChannels();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleClearFavorites = () => {
    clearFavorites();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <SymbolView name="chevron.left" size={24} tintColor="#E1E6F0" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Playlist Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playlist Configuration</Text>
          <Text style={styles.description}>
            Enter the URL of your M3U or M3U8 IPTV playlist. The app will automatically parse and group your channels.
          </Text>
          
          <TextInput
            style={styles.input}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="https://example.com/playlist.m3u"
            placeholderTextColor="#888"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <Pressable 
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            onPress={handleSaveUrl}
          >
            <SymbolView name="externaldrive.fill.badge.checkmark" size={18} tintColor="#0F1014" />
            <Text style={styles.primaryButtonText}>Save & Sync</Text>
          </Pressable>

          {isSaved && (
            <Text style={styles.successText}>Changes saved and channels syncing!</Text>
          )}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Channels Loaded</Text>
            <Text style={styles.statValue}>{channels.length}</Text>
          </View>

          <Pressable 
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            onPress={handleForceRefresh}
          >
            <SymbolView name="arrow.triangle.2.circlepath" size={18} tintColor="#E1E6F0" />
            <Text style={styles.secondaryButtonText}>Force Refresh List</Text>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}
            onPress={handleClearFavorites}
          >
            <SymbolView name="trash.fill" size={18} tintColor="#FF4C4C" />
            <Text style={styles.dangerButtonText}>Clear All Favorites</Text>
          </Pressable>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>
            Built with React Native Web & Expo Router. Featuring HLS video streaming, zero-dependency parser, and a cinematic UI.
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1014',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#16181F',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  headerTitle: {
    color: '#E1E6F0',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
    backgroundColor: '#16181F',
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    color: '#E1E6F0',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    color: '#8F98B0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#0F1014',
    borderWidth: 1,
    borderColor: '#2A2D3A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#E1E6F0',
    fontSize: 16,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#E1E6F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  primaryButtonText: {
    color: '#0F1014',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  secondaryButtonText: {
    color: '#E1E6F0',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 76, 76, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 76, 76, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  dangerButtonText: {
    color: '#FF4C4C',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  successText: {
    color: '#4CAF50',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F1014',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statLabel: {
    color: '#8F98B0',
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    color: '#00E5FF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  versionText: {
    color: '#8F98B0',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
