import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';

interface Props {
  activeTab: 'tv' | 'all' | 'favorites';
  onTabChange: (tab: 'tv' | 'all' | 'favorites') => void;
}

export function BottomNavbar({ activeTab, onTabChange }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <Pressable 
          style={[styles.tab, activeTab === 'tv' && styles.activeTab]}
          onPress={() => onTabChange('tv')}
        >
          <SymbolView 
            name="tv" 
            size={24} 
            tintColor={activeTab === 'tv' ? '#FFFFFF' : '#8F98B0'} 
          />
          <Text style={[styles.label, activeTab === 'tv' && styles.activeLabel]}>
            Tamil TV
          </Text>
        </Pressable>

        <Pressable 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => onTabChange('all')}
        >
          <SymbolView 
            name="globe.americas.fill" 
            size={24} 
            tintColor={activeTab === 'all' ? '#FFFFFF' : '#8F98B0'} 
          />
          <Text style={[styles.label, activeTab === 'all' && styles.activeLabel]}>
            Global
          </Text>
        </Pressable>

        <Pressable 
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => onTabChange('favorites')}
        >
          <SymbolView 
            name="star.fill" 
            size={24} 
            tintColor={activeTab === 'favorites' ? '#FFFFFF' : '#8F98B0'} 
          />
          <Text style={[styles.label, activeTab === 'favorites' && styles.activeLabel]}>
            Favorites
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(22, 24, 31, 0.85)',
    borderRadius: 30,
    padding: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
      } as any,
    }),
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  label: {
    color: '#8F98B0',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  activeLabel: {
    color: '#FFFFFF',
  },
});
