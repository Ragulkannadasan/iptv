import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import PlayerComponent from './PlayerComponent';
import { Channel } from '../utils/m3uParser';

interface Props {
  channels: Channel[];
}

export function Hero({ channels }: Props) {
  const router = useRouter();

  // Find Puthiya Thalaimurai
  const heroChannel = useMemo(() => {
    if (!channels || channels.length === 0) return null;
    return channels.find(c => c.name.toLowerCase().includes('puthiya thalaimurai')) || channels[0];
  }, [channels]);

  if (!heroChannel) return null;

  const handlePlay = () => {
    router.push({
      pathname: '/player',
      params: { url: encodeURIComponent(heroChannel.url), name: heroChannel.name }
    });
  };

  return (
    <View style={styles.container}>
      {/* Background Player */}
      <View style={styles.playerWrapper}>
        <PlayerComponent streamUrl={heroChannel.url} isHero={true} />
      </View>

      {/* Gradient Overlay for blending into the background */}
      <LinearGradient
        colors={['transparent', 'rgba(15,16,20,0.5)', '#0F1014']}
        style={styles.gradient}
      />

      {/* Hero Content */}
      <View style={styles.content}>
        <View style={styles.badgeContainer}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        
        <Text style={styles.title} numberOfLines={2}>
          {heroChannel.name}
        </Text>
        <Text style={styles.category}>
          {heroChannel.category}
        </Text>

        <View style={styles.buttonContainer}>
          <Pressable 
            style={({ pressed }) => [styles.playButton, pressed && styles.pressed]} 
            onPress={handlePlay}
          >
            <SymbolView name="play.fill" size={24} tintColor="#0F1014" />
            <Text style={styles.playButtonText}>Watch Now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#0F1014',
    position: 'relative',
    marginBottom: 20,
  },
  playerWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 20, 
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.5)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4C4C',
    marginRight: 6,
  },
  liveText: {
    color: '#FF4C4C',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  title: {
    color: '#FFF',
    fontSize: Platform.OS === 'web' ? 28 : 24,
    fontWeight: '900',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  category: {
    color: '#CCC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  playButton: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 4px 15px rgba(255, 255, 255, 0.2)',
        cursor: 'pointer',
      } as any,
    }),
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  playButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
