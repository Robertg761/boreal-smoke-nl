import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const TimelineSlider = ({ hours, currentHour, onChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forecast Timeline</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.timeline}>
          {Array.from({ length: hours + 1 }, (_, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.hourBlock, currentHour === i && styles.selectedHour]}
              onPress={() => onChange(i)}
            >
              <Text style={[styles.hourText, currentHour === i && styles.selectedText]}>
                {i === 0 ? 'Now' : `+${i}h`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  timeline: {
    flexDirection: 'row',
  },
  hourBlock: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 2,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  selectedHour: {
    backgroundColor: '#667eea',
  },
  hourText: {
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default TimelineSlider;
