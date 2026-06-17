import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

interface PlayerProps {
  streamUrl: string;
  isHero?: boolean;
}

export default function PlayerComponent({ streamUrl, isHero = false }: PlayerProps) {
  console.log('PlayerComponent (Native) RENDERING');
  const player = useVideoPlayer(streamUrl, player => {
    console.log('PlayerComponent (Native) initialized with url:', streamUrl);
    player.loop = isHero;
    player.muted = isHero;
    player.play();
  });

  return (
    <View style={isHero ? styles.heroContainer : styles.container}>
      <VideoView 
        style={styles.video} 
        player={player} 
        nativeControls={!isHero}
        contentFit={isHero ? "cover" : "contain"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  heroContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
});
