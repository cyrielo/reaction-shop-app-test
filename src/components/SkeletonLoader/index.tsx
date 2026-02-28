import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { borderRadius as themeRadius } from '../../theme';

export interface SkeletonLoaderProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width,
  height,
  borderRadius = themeRadius.sm,
}) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View
      style={{ width, height, borderRadius, overflow: 'hidden' }}
      accessibilityRole="none"
      importantForAccessibility="no"
    >
      <Animated.View style={[styles.fill, { opacity }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: '#E1E3E5',
  },
});

export default SkeletonLoader;
