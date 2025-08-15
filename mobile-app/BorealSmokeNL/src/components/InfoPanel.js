import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AQHIIndicator from './AQHIIndicator';
import TimelineSlider from './TimelineSlider';

const InfoPanel = ({ data, onClose, timelineHours, currentTimelineHour, onTimelineChange }) => {
  if (!data) return null;

  const isFire = data.type === 'fire';
  const isCommunity = data.type === 'community';

  const renderFireDetails = () => (
    <View>
      <View style={styles.header}>
        <Icon name="fire" size={24} color="#FFA500" />
        <Text style={styles.title}>{data.displayName}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Status:</Text>
        <Text style={styles.detailValue}>{data.status}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Size:</Text>
        <Text style={styles.detailValue}>{data.size_hectares} hectares</Text>
      </View>
    </View>
  );

  const renderCommunityDetails = () => (
    <AQHIIndicator 
      value={data.aqhi} 
      communityName={data.name} 
    />
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="close" size={24} color="#666" />
      </TouchableOpacity>
      
      {isFire && renderFireDetails()}
      {isCommunity && renderCommunityDetails()}

      <View style={styles.timelineContainer}>
        <TimelineSlider 
          hours={timelineHours}
          currentHour={currentTimelineHour}
          onChange={onTimelineChange}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 60,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  timelineContainer: {
    marginTop: 15,
  },
});

export default InfoPanel;
