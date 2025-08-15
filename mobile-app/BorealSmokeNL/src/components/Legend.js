import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Legend = () => {
  const [expanded, setExpanded] = useState(true);

  const fireStatuses = [
    { status: 'OC', label: 'Out of Control', color: '#FF0000' },
    { status: 'BH', label: 'Being Held', color: '#FF9800' },
    { status: 'UC', label: 'Under Control', color: '#4CAF50' },
    { status: 'OUT', label: 'Extinguished', color: '#9E9E9E' },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.title}>Fire Status Legend</Text>
        <Icon name={expanded ? "chevron-down" : "chevron-up"} size={20} color="#333" />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.legendItems}>
          {fireStatuses.map((item) => (
            <View key={item.status} style={styles.legendItem}>
              <View style={styles.iconWrapper}>
                <Icon name="fire" size={16} color={item.color} />
              </View>
              <Text style={styles.statusCode}>{item.status}</Text>
              <Text style={styles.statusLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  legendItems: {
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statusCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    width: 35,
  },
  statusLabel: {
    fontSize: 12,
    color: '#555',
  },
});

export default Legend;
