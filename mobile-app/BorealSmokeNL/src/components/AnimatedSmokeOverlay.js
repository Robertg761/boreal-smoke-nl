/**
 * Animated Smoke Overlay Component
 * Shows pulsing smoke effect around Out of Control fires
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { Circle } from 'react-native-maps';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AnimatedSmokeOverlay = ({ fire, windDirection = 0, windSpeed = 10 }) => {
  // Only show for Out of Control fires
  if (fire.status !== 'OC') return null;

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const driftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create pulsing animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );

    // Create drift animation based on wind
    const driftAnimation = Animated.loop(
      Animated.timing(driftAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );

    pulseAnimation.start();
    driftAnimation.start();

    return () => {
      pulseAnimation.stop();
      driftAnimation.stop();
    };
  }, [pulseAnim, driftAnim]);

  // Calculate smoke radius based on fire size
  const getBaseRadius = (hectares) => {
    if (hectares < 100) return 5000;
    if (hectares < 1000) return 10000;
    if (hectares < 5000) return 20000;
    return 30000; // Very large fires
  };

  const baseRadius = getBaseRadius(fire.size_hectares || 0);

  // Calculate wind offset for smoke drift
  const windOffsetX = Math.sin((windDirection * Math.PI) / 180) * windSpeed * 0.0001;
  const windOffsetY = Math.cos((windDirection * Math.PI) / 180) * windSpeed * 0.0001;

  // Animated values
  const animatedRadius = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [baseRadius, baseRadius * 1.3],
  });

  const animatedOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.1],
  });

  const driftX = driftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, windOffsetX * 5],
  });

  const driftY = driftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, windOffsetY * 5],
  });

  return (
    <>
      {/* Inner smoke layer */}
      <Circle
        center={{
          latitude: fire.latitude,
          longitude: fire.longitude,
        }}
        radius={baseRadius * 0.5}
        fillColor="rgba(128, 128, 128, 0.4)"
        strokeWidth={0}
      />
      
      {/* Middle smoke layer */}
      <Circle
        center={{
          latitude: fire.latitude + windOffsetX,
          longitude: fire.longitude + windOffsetY,
        }}
        radius={baseRadius * 0.8}
        fillColor="rgba(128, 128, 128, 0.25)"
        strokeWidth={0}
      />

      {/* Outer animated smoke layer */}
      <AnimatedCircle
        center={{
          latitude: Animated.add(fire.latitude, driftY),
          longitude: Animated.add(fire.longitude, driftX),
        }}
        radius={animatedRadius}
        fillColor={`rgba(128, 128, 128, ${animatedOpacity})`}
        strokeWidth={0}
      />

      {/* Danger zone indicator */}
      {fire.size_hectares > 1000 && (
        <Circle
          center={{
            latitude: fire.latitude,
            longitude: fire.longitude,
          }}
          radius={baseRadius * 0.3}
          fillColor="rgba(255, 0, 0, 0.15)"
          strokeColor="rgba(255, 0, 0, 0.3)"
          strokeWidth={2}
        />
      )}
    </>
  );
};

export default AnimatedSmokeOverlay;
