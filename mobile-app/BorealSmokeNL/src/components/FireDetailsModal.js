import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FireDetailsModal = ({ visible, fire, onClose }) => {
  if (!fire) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{fire.displayName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statusBadge}>
            <View style={[styles.statusIndicator, { backgroundColor: fire.statusColor }]} />
            <Text style={styles.statusText}>{fire.status}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="fire" size={20} color="#666" />
            <Text style={styles.detailLabel}>Size:</Text>
            <Text style={styles.detailValue}>{fire.size_hectares} hectares</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="map-marker" size={20} color="#666" />
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>
              {fire.latitude.toFixed(4)}, {fire.longitude.toFixed(4)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="calendar" size={20} color="#666" />
            <Text style={styles.detailLabel}>Started:</Text>
            <Text style={styles.detailValue}>
              {new Date(fire.start_date).toLocaleDateString()}
            </Text>
          </View>
          
          {fire.cause && (
            <View style={styles.detailRow}>
              <Icon name="information" size={20} color="#666" />
              <Text style={styles.detailLabel}>Cause:</Text>
              <Text style={styles.detailValue}>{fire.cause}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  detailLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

export default FireDetailsModal;
