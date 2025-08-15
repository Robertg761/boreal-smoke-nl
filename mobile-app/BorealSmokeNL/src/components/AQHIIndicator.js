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

const AQHIIndicator = ({ value, communityName }) => {
  const getAQHIInfo = (val) => {
    if (val <= 3) {
      return {
        label: 'Low Risk',
        color: '#00FF00',
        gradientColors: ['#00FF00', '#00DD00'],
        icon: 'emoticon-happy',
        message: 'Ideal air quality for outdoor activities',
      };
    } else if (val <= 6) {
      return {
        label: 'Moderate Risk',
        color: '#FFFF00',
        gradientColors: ['#FFFF00', '#FFD700'],
        icon: 'emoticon-neutral',
        message: 'Consider reducing prolonged outdoor exertion',
      };
    } else if (val <= 10) {
      return {
        label: 'High Risk',
        color: '#FFA500',
        gradientColors: ['#FFA500', '#FF8C00'],
        icon: 'emoticon-sad',
        message: 'Reduce outdoor activities if experiencing symptoms',
      };
    } else {
      return {
        label: 'Very High Risk',
        color: '#FF0000',
        gradientColors: ['#FF0000', '#CC0000'],
        icon: 'alert-circle',
        message: 'Avoid outdoor activities',
      };
    }
  };

  const info = getAQHIInfo(value);

  return (
    <LinearGradient
      colors={info.gradientColors}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.header}>
        <Icon name={info.icon} size={24} color="#FFF" />
        <Text style={styles.communityName}>{communityName}</Text>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{info.label}</Text>
      </View>
      
      <Text style={styles.message}>{info.message}</Text>
      
      <View style={styles.scale}>
        <View style={styles.scaleBar}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <View
              key={i}
              style={[
                styles.scaleSegment,
                { opacity: i <= value ? 1 : 0.3 }
              ]}
            />
          ))}
        </View>
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleLabel}>1</Text>
          <Text style={styles.scaleLabel}>10+</Text>
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
  },
});

export default AQHIIndicator;
