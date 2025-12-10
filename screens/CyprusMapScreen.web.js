import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

const CyprusMapScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logowtgnicosia.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.card}>
        <Text style={styles.title}>Map is unavailable on web</Text>
        <Text style={styles.subtitle}>
          Please open this experience in the Expo Go app or a native build to explore the map view.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  logo: {
    width: 180,
    height: 80,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: 420,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CyprusMapScreen;
