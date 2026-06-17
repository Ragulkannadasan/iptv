import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Hls from 'hls.js';

interface PlayerProps {
  streamUrl: string;
  isHero?: boolean;
}

export default function PlayerComponent({ streamUrl, isHero = false }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let hls: Hls;

    if (videoRef.current) {
      const video = videoRef.current;
      console.log('Video element found, streamUrl:', streamUrl);

      if (Hls.isSupported()) {
        console.log('Hls.js is supported. Initializing...');
        hls = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          debug: true // Enable HLS debug logs
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('Manifest parsed. Playing video...');
          video.play().catch((e) => {
            console.log("Playback prevented by browser autoplay policy:", e);
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.warn('HLS Error Event:', data.type, data.details, data.fatal);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (!isHero) setError('Network Error: Failed to load stream');
                // Only retry once or delay retry to avoid infinite loop
                setTimeout(() => hls.startLoad(), 2000);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                if (!isHero) setError('Media Error: Stream format unsupported');
                hls.recoverMediaError();
                break;
              default:
                if (!isHero) setError('Stream is offline or dead.');
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('Native HLS supported (Safari).');
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          console.log('Native metadata loaded. Playing video...');
          video.play().catch((e) => console.log('Native play error:', e));
        });
        video.addEventListener('error', (e) => {
          console.warn('Native video error:', e);
          if (!isHero) setError('Failed to load native HLS stream.');
        });
      } else {
        console.error('HLS not supported in this browser.');
        setError('HLS is not supported in this browser.');
      }
    } else {
      console.error('videoRef.current is null!');
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl]);

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <video
          ref={videoRef}
          style={{ 
            width: isHero ? '100%' : '100vw', 
            height: isHero ? '100%' : '100vh', 
            backgroundColor: '#000', 
            objectFit: isHero ? 'cover' : 'contain',
            pointerEvents: isHero ? 'none' : 'auto'
          }}
          controls={!isHero}
          autoPlay
          muted={true}
          playsInline
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF4C4C',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
