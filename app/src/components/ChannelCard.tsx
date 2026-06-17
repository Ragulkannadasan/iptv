import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Channel } from '../utils/m3uParser';

interface Props {
  channel: Channel;
  onPress: (channel: Channel) => void;
}

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

import { SymbolView } from 'expo-symbols';
import { useStore } from '../store/useStore';

export const ChannelCard = React.memo(({ channel, onPress }: Props) => {
  const { favorites, toggleFavorite } = useStore();
  const isFavorite = favorites.includes(channel.id);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(channel)}
    >
      <View style={styles.imageContainer}>
        {channel.logo ? (
          <Image
            style={styles.image}
            source={channel.logo}
            placeholder={{ blurhash }}
            contentFit="contain"
            transition={300}
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {channel.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Pressable 
          style={styles.favoriteButton} 
          onPress={(e) => {
            e.stopPropagation(); // Prevent triggering the card's onPress
            toggleFavorite(channel.id);
          }}
        >
          <SymbolView 
            name={isFavorite ? "star.fill" : "star"} 
            size={24} 
            tintColor={isFavorite ? "#FFD700" : "rgba(255,255,255,0.5)"} 
          />
        </Pressable>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {channel.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {channel.category}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: 'transparent',
    borderRadius: 8,
    marginRight: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        transition: 'transform 0.2s ease',
        cursor: 'pointer',
      } as any,
    }),
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#16181F',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2D3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#E1E6F0',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoContainer: {
    paddingTop: 8,
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  name: {
    color: '#E1E6F0',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'left',
  },
  category: {
    color: '#8F98B0',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'left',
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
  },
});
