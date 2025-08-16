/**
 * Fire Statistics Dashboard Component
 * Shows summary statistics of active wildfires
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const FireStatsDashboard = ({ wildfires, isExpanded, onToggle }) => {
  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!wildfires || wildfires.length === 0) {
      return {
        totalFires: 0,
        nlFires: 0,
        outOfControl: 0,
        totalArea: 0,
        largestFire: null,
        newestFire: null,
      };
    }

    const nlFires = wildfires.filter(f => f.agency === 'nl');
    const ocFires = wildfires.filter(f => f.status === 'OC');
    const totalArea = wildfires.reduce((sum, f) => sum + (f.size_hectares || 0), 0);
    
    const largestFire = [...wildfires].sort((a, b) => 
      (b.size_hectares || 0) - (a.size_hectares || 0)
    )[0];
    
    const newestFire = [...wildfires].sort((a, b) => {
      const dateA = new Date(a.start_date || 0);
      const dateB = new Date(b.start_date || 0);
      return dateB - dateA;
    })[0];

    return {
      totalFires: wildfires.length,
      nlFires: nlFires.length,
      outOfControl: ocFires.length,
      totalArea: Math.round(totalArea),
      largestFire,
      newestFire,
    };
  }, [wildfires]);

  const formatArea = (hectares) => {
    if (hectares < 1000) {
      return `${hectares} ha`;
    }
    return `${(hectares / 1000).toFixed(1)}k ha`;
  };

  const getDaysAgo = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    const now = new Date();
    const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E53']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Icon name="fire" size={24} color="#FFF" />
            <Text style={styles.headerTitle}>Fire Statistics</Text>
            <Icon 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color="#FFF" 
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.statsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Total Fires */}
            <View style={[styles.statCard, { backgroundColor: '#FFE5E5' }]}>
              <Icon name="fire-alert" size={28} color="#FF4444" />
              <Text style={styles.statValue}>{stats.totalFires}</Text>
              <Text style={styles.statLabel}>Active Fires</Text>
              <Text style={styles.statDetail}>{stats.nlFires} in NL</Text>
            </View>

            {/* Out of Control */}
            <View style={[styles.statCard, { backgroundColor: '#FFE5E5' }]}>
              <Icon name="alert-circle" size={28} color="#FF6B6B" />
              <Text style={styles.statValue}>{stats.outOfControl}</Text>
              <Text style={styles.statLabel}>Out of Control</Text>
              <Text style={styles.statDetail}>
                {stats.outOfControl > 0 ? 'Immediate Risk' : 'Controlled'}
              </Text>
            </View>

            {/* Total Area */}
            <View style={[styles.statCard, { backgroundColor: '#FFF5E5' }]}>
              <Icon name="texture-box" size={28} color="#FF9800" />
              <Text style={styles.statValue}>{formatArea(stats.totalArea)}</Text>
              <Text style={styles.statLabel}>Total Area</Text>
              <Text style={styles.statDetail}>Burned</Text>
            </View>

            {/* Largest Fire */}
            {stats.largestFire && (
              <View style={[styles.statCard, { backgroundColor: '#FFE5F1' }]}>
                <Icon name="arrow-expand-all" size={28} color="#E91E63" />
                <Text style={styles.statValue}>
                  {formatArea(stats.largestFire.size_hectares || 0)}
                </Text>
                <Text style={styles.statLabel}>Largest Fire</Text>
                <Text style={styles.statDetail}>
                  Fire {stats.largestFire.fire_id}
                </Text>
              </View>
            )}

            {/* Newest Fire */}
            {stats.newestFire && (
              <View style={[styles.statCard, { backgroundColor: '#E5F5FF' }]}>
                <Icon name="new-box" size={28} color="#2196F3" />
                <Text style={styles.statValue}>
                  {getDaysAgo(stats.newestFire.start_date)}
                </Text>
                <Text style={styles.statLabel}>Newest Fire</Text>
                <Text style={styles.statDetail}>
                  Fire {stats.newestFire.fire_id}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Risk Assessment */}
          <View style={styles.riskContainer}>
            <LinearGradient
              colors={
                stats.outOfControl > 3 
                  ? ['#FF0000', '#FF4444']
                  : stats.outOfControl > 0
                  ? ['#FF9800', '#FFB74D']
                  : ['#4CAF50', '#66BB6A']
              }
              style={styles.riskBadge}
            >
              <Text style={styles.riskText}>
                {stats.outOfControl > 3 
                  ? 'HIGH RISK'
                  : stats.outOfControl > 0
                  ? 'MODERATE RISK'
                  : 'LOW RISK'}
              </Text>
            </LinearGradient>
            <Text style={styles.riskDescription}>
              {stats.outOfControl > 3 
                ? 'Multiple uncontrolled fires detected. Stay alert for air quality warnings.'
                : stats.outOfControl > 0
                ? 'Some fires are out of control. Monitor air quality in affected areas.'
                : 'All fires are under control or out.'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 10,
    right: 10,  // Full width
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    padding: 12,
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 10,
  },
  statsContainer: {
    padding: 10,
  },
  statCard: {
    width: 120,
    padding: 15,
    marginRight: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statDetail: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  riskContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  riskText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  riskDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

export default FireStatsDashboard;
