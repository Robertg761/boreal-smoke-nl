/**
 * AQHI Indicator Component
 * Displays the Air Quality Health Index for a community
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { calculateAQHIFromPM25 } from '../utils/aqhiUtils';

const AQHIIndicator = ({ value, communityName, pm25 = null, isOfficial = false }) => {
  // Use the AQHI value directly from backend (now properly calculated)
  const actualValue = value;
  
  // Handle null/undefined values
  const displayValue = actualValue !== null && actualValue !== undefined ? actualValue : 'N/A';
  const numericValue = typeof displayValue === 'number' ? displayValue : 0;
  
  // Format PM2.5 value
  const pm25Display = pm25 !== null ? `${Math.round(pm25)} µg/m³` : null;
  
  const getAQHIInfo = (val) => {
    if (val <= 3) {
      return {
        label: 'Low Risk',
        color: '#00FF00',
        gradientColors: ['#00FF00', '#00DD00'],
        icon: 'emoticon-happy',
        message: 'Ideal air quality for outdoor activities',
        healthAdvice: 'Enjoy your usual outdoor activities',
      };
    } else if (val <= 6) {
      return {
        label: 'Moderate Risk',
        color: '#FFFF00',
        gradientColors: ['#FFFF00', '#FFD700'],
        icon: 'emoticon-neutral',
        message: 'Consider reducing prolonged outdoor exertion',
        healthAdvice: 'Sensitive individuals should consider reducing prolonged or heavy exertion',
      };
    } else if (val <= 10) {
      return {
        label: 'High Risk',
        color: '#FFA500',
        gradientColors: ['#FFA500', '#FF8C00'],
        icon: 'emoticon-sad',
        message: 'Reduce outdoor activities if experiencing symptoms',
        healthAdvice: 'Children and elderly should reduce physical exertion',
      };
    } else {
      // Values above 10 - extreme conditions
      return {
        label: val > 15 ? 'Extreme Risk' : 'Very High Risk',
        color: '#FF0000',
        gradientColors: val > 15 ? ['#8B0000', '#FF0000'] : ['#FF0000', '#CC0000'],
        icon: val > 15 ? 'alert-octagon' : 'alert-circle',
        message: val > 15 ? 'STAY INDOORS - Hazardous air quality' : 'Avoid outdoor activities',
        healthAdvice: val > 15 ? 
          'Everyone should avoid all outdoor exertion' : 
          'Everyone should reduce outdoor activities',
      };
    }
  };

  const info = getAQHIInfo(numericValue);

  return (
    <LinearGradient
      colors={info.gradientColors}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.header}>
        <Icon name={info.icon} size={24} color="#FFF" />
        <View style={styles.headerText}>
          <Text style={styles.communityName}>{communityName}</Text>
          {isOfficial && (
            <View style={styles.officialBadge}>
              <Icon name="check-circle" size={14} color="#FFF" />
              <Text style={styles.officialText}>Official Data</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>
          {displayValue}{numericValue > 10 ? '+' : ''}
        </Text>
        <Text style={styles.label}>{info.label}</Text>
      </View>
      
      <Text style={styles.message}>{info.message}</Text>
      {pm25Display && (
        <Text style={styles.pm25Text}>PM2.5: {pm25Display}</Text>
      )}
      
      <View style={styles.scale}>
        <View style={styles.scaleHeader}>
          <Text style={styles.scaleTitle}>Air Quality Health Index</Text>
        </View>
        <View style={styles.scaleBar}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <View
              key={i}
              style={[
                styles.scaleSegment,
                { 
                  backgroundColor: i <= 3 ? '#00FF00' : 
                                   i <= 6 ? '#FFFF00' : 
                                   i <= 10 ? '#FFA500' : '#FF0000',
                  opacity: i <= Math.min(numericValue, 10) ? 1 : 0.3 
                }
              ]}
            />
          ))}
        </View>
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleLabel}>Low</Text>
          <Text style={styles.scaleLabel}>Moderate</Text>
          <Text style={styles.scaleLabel}>High</Text>
          <Text style={styles.scaleLabel}>Very High</Text>
        </View>
        <View style={styles.scaleNumbers}>
          <Text style={styles.scaleNumber}>1</Text>
          <Text style={styles.scaleNumber}>3</Text>
          <Text style={styles.scaleNumber}>6</Text>
          <Text style={styles.scaleNumber}>10+</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  communityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 10,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  value: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
  },
  label: {
    fontSize: 16,
    color: '#FFF',
    marginLeft: 10,
    opacity: 0.9,
  },
  message: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 10,
  },
  scale: {
    marginTop: 5,
  },
  scaleBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scaleSegment: {
    flex: 1,
    backgroundColor: '#FFF',
    marginHorizontal: 1,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  scaleLabel: {
    fontSize: 10,
    color: '#FFF',
    opacity: 0.7,
    flex: 1,
    textAlign: 'center',
  },
  pm25Text: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.8,
    marginBottom: 5,
    fontStyle: 'italic',
  },
  scaleHeader: {
    marginBottom: 5,
  },
  scaleTitle: {
    fontSize: 11,
    color: '#FFF',
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '600',
  },
  scaleNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  scaleNumber: {
    fontSize: 9,
    color: '#FFF',
    opacity: 0.6,
    flex: 1,
    textAlign: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  officialText: {
    fontSize: 11,
    color: '#FFF',
    opacity: 0.9,
    marginLeft: 4,
  },
});

export default AQHIIndicator;
