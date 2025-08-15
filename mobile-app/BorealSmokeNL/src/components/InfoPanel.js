import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AQHIIndicator from './AQHIIndicator';
import TimelineSlider from './TimelineSlider';
import { getFireLocation, getLocationDescription } from '../utils/locationUtils';

const InfoPanel = ({ data, onClose, timelineHours, currentTimelineHour, onTimelineChange }) => {
  if (!data) return null;

  const isFire = data.type === 'fire';
  const isCommunity = data.type === 'community';

  const renderFireDetails = () => {
    const location = getFireLocation(data);
    
    const statusLabels = {
      'OC': 'Out of Control',
      'BH': 'Being Held',
      'UC': 'Under Control',
      'OUT': 'Extinguished',
    };
    
    // Get size value - check various possible properties
    const sizeValue = data.size_hectares || data.sizeHectares || data.size || 0;
    const hasSize = sizeValue > 0;
    
    return (
      <View>
        <View style={styles.header}>
          <Icon name="fire" size={24} color={data.statusColor || '#FFA500'} />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{location.primary || 'Wildfire'}</Text>
            <Text style={styles.subtitle}>{location.secondary || 'Unknown location'}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={[styles.detailValue, { color: data.statusColor }]}>
            {statusLabels[data.status] || data.status || 'Unknown'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Size:</Text>
          <Text style={styles.detailValue}>
            {hasSize ? `${sizeValue.toLocaleString()} hectares` : 'Size not available'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={[styles.detailValue, styles.locationText]} numberOfLines={2}>
            {location.detailed || 'Location not available'}
          </Text>
        </View>
        <View style={styles.coordsRow}>
          <Text style={styles.coordsLabel}>GPS:</Text>
          <Text style={styles.detailCoords}>{location.coordinates || 'N/A'}</Text>
        </View>
      </View>
    );
  };

  const renderCommunityDetails = () => {
    const location = getLocationDescription(data.lat, data.lon, data.name);
    
    return (
      <View>
        <View style={styles.header}>
          <Icon name="home-city" size={24} color="#667eea" />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{data.name}</Text>
            <Text style={styles.subtitle}>{location.secondary}</Text>
          </View>
        </View>
        {data.emergency && (
          <View style={[styles.alertBox, { 
            backgroundColor: data.emergency.level === 'EVACUATE' ? '#FFE5E5' : '#FFF3E0' 
          }]}>
            <Icon 
              name={data.emergency.level === 'EVACUATE' ? 'alert-octagon' : 'alert'} 
              size={20} 
              color={data.emergency.level === 'EVACUATE' ? '#FF0000' : '#FF9800'} 
            />
            <Text style={styles.alertText}>
              {data.emergency.level === 'EVACUATE' ? 'EVACUATION ZONE' : 'ALERT ZONE'} - 
              {data.emergency.distance.toFixed(1)}km from active fire
            </Text>
          </View>
        )}
        <AQHIIndicator 
          value={data.currentAQHI || data.aqhi} 
          communityName={data.name}
          pm25={data.pm25 || data.predictionData?.pm25_concentration}
        />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>GPS:</Text>
          <Text style={styles.detailCoords}>{location.coordinates}</Text>
        </View>
      </View>
    );
  };

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
  titleContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 70,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    color: '#333',
  },
  locationText: {
    flexWrap: 'wrap',
  },
  coordsRow: {
    flexDirection: 'row',
    marginTop: 5,
    alignItems: 'center',
  },
  coordsLabel: {
    fontSize: 12,
    color: '#999',
    width: 70,
  },
  timelineContainer: {
    marginTop: 15,
  },
  detailCoords: {
    fontSize: 12,
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  missingData: {
    color: '#999',
    fontStyle: 'italic',
  },
});

export default InfoPanel;
