import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlayerComponent from '../components/PlayerComponent';
import { SymbolView } from 'expo-symbols';

export default function PlayerScreen() {
  const params = useLocalSearchParams<{ url: string; name: string }>();
  const router = useRouter();

  const url = params.url ? decodeURIComponent(params.url) : null;
  const name = params.name;

  console.log('PlayerScreen MOUNTING. URL:', url, 'Name:', name);

  if (!url) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No stream URL provided.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Absolute Header Overlay */}
      <SafeAreaView style={styles.header} edges={['top', 'left', 'right']}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <SymbolView name="chevron.down" size={32} tintColor="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{name}</Text>
        <View style={styles.placeholderIcon} />
      </SafeAreaView>

      {/* Cross-Platform Player Component */}
      <PlayerComponent streamUrl={url} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Platform.OS === 'web' ? '100vh' : '100%',
    width: '100%',
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.4)', // Slight gradient/dark overlay
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
    textShadow: '-1px 1px 10px rgba(0, 0, 0, 0.75)',
  },
  placeholderIcon: {
    width: 48, // Balances the close button for center alignment
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0F0F13',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF4C4C',
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backText: {
    color: '#FFF',
    fontSize: 16,
  },
});
