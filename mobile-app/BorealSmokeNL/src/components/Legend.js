import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Legend = () => {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const fireStatuses = [
    { status: 'OC', label: 'Out of Control', color: '#FF0000' },
    { status: 'BH', label: 'Being Held', color: '#FF9800' },
    { status: 'UC', label: 'Under Control', color: '#4CAF50' },
    { status: 'OUT', label: 'Extinguished', color: '#9E9E9E' },
  ];

  const toggleExpanded = () => {
    const toValue = expanded ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity 
      style={[styles.container, expanded && styles.containerExpanded]} 
      onPress={toggleExpanded}
      activeOpacity={0.8}
    >
      {fireStatuses.map((item, index) => (
        <View key={item.status} style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: item.color }]} />
          <View style={styles.textContainer}>
            <Text style={styles.statusLabel}>{item.status}</Text>
            {expanded && (
              <Text style={styles.fullLabel}>{item.label}</Text>
            )}
          </View>
        </View>
      ))}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 10,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    gap: 8,
  },
  containerExpanded: {
    flexDirection: 'column',
    paddingVertical: 12,
    paddingHorizontal: 15,
    gap: 10,
    maxWidth: 180,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  statusLabel: {
    fontSize: 11,
    color: '#333',
    fontWeight: '600',
    minWidth: 28,
  },
  fullLabel: {
    fontSize: 11,
    color: '#666',
  },
});

export default Legend;
