import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../constants/theme";

export const SplashScreen = ({ navigation, onFinish }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (navigation && typeof navigation.replace === "function") {
        navigation.replace("Home");
      } else if (onFinish) {
        onFinish();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, onFinish]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.accentDark || COLORS.background, COLORS.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animatable.View
        animation={{
          0: { opacity: 0, transform: [{ scale: 0.8 }] },
          1: { opacity: 1, transform: [{ scale: 1 }] },
        }}
        duration={700}
        easing="ease-out"
        useNativeDriver
        style={styles.logoWrapper}
      >
        <Animatable.View
          animation={{
            0: { transform: [{ scale: 0.98 }] },
            0.5: { transform: [{ scale: 1.02 }] },
            1: { transform: [{ scale: 0.98 }] },
          }}
          iterationCount="infinite"
          duration={1400}
          easing="ease-in-out"
          useNativeDriver
          style={styles.glow}
        >
          {hasError ? (
            <View style={styles.logoFallback} />
          ) : (
            <Image
              source={require("../assets/images/logore.png")}
              style={styles.logo}
              resizeMode="contain"
              onError={() => setHasError(true)}
            />
          )}
        </Animatable.View>
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    padding: 10,
    borderRadius: 24,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  logo: {
    width: 200,
    height: 200,
  },
  logoFallback: {
    width: 200,
    height: 200,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
