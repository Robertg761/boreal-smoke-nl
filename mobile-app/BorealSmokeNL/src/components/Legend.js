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
    bottom: 20,
    left: 10,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    gap: 15,
  },
  containerExpanded: {
    flexDirection: 'column',
    paddingVertical: 12,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  statusLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    minWidth: 35,
  },
  fullLabel: {
    fontSize: 11,
    color: '#666',
  },
});

export default Legend;
