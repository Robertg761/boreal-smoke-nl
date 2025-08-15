import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Legend = () => {
  const [expanded, setExpanded] = useState(true);

  const aqhiLevels = [
    { level: '1-3', risk: 'Low', color: '#00FF00' },
    { level: '4-6', risk: 'Moderate', color: '#FFFF00' },
    { level: '7-10', risk: 'High', color: '#FFA500' },
    { level: '10+', risk: 'Very High', color: '#FF0000' },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.title}>AQHI Legend</Text>
        <Icon name={expanded ? "chevron-down" : "chevron-up"} size={20} color="#333" />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.legendItems}>
          {aqhiLevels.map((item) => (
            <View key={item.risk} style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: item.color }]} />
              <Text style={styles.levelText}>{item.level}</Text>
              <Text style={styles.riskText}>{item.risk}</Text>
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
  colorBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  levelText: {
    fontSize: 12,
    color: '#333',
    width: 35,
  },
  riskText: {
    fontSize: 12,
    color: '#555',
  },
});

export default Legend;
