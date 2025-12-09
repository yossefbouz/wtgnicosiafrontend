import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Animation Values - Initialize to visible state to prevent blank screen
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // useEffect(() => {
    //     // Optional: Add subtle entrance if needed, but keep default visible
    // }, [isLoggedIn]);

    const handleLogin = () => {
        if (email && password) {
            // Simulate API call/loading
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setIsLoggedIn(true);
                // Reset animations for next screen
                fadeAnim.setValue(0);
                slideAnim.setValue(50);
                scaleAnim.setValue(0.9);
            });
        }
    };

    const handleLogout = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsLoggedIn(false);
            setEmail('');
            setPassword('');
            // Reset animations
            fadeAnim.setValue(0);
            slideAnim.setValue(50);
            scaleAnim.setValue(0.9);
        });
    };

    // Dummy user data
    const userProfile = {
        name: "Alex K.",
        bio: "Nightlife enthusiast & party seeker. Always looking for the best vibes in Cyprus. 🇨🇾 ✨",
        stats: {
            yes: 42,
            no: 15
        }
    };

    if (!isLoggedIn) {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Animated.View style={[
                            styles.loginContent,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: slideAnim },
                                    { scale: scaleAnim }
                                ]
                            }
                        ]}>
                            <View style={styles.header}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="person" size={40} color={COLORS.primary} />
                                </View>
                                <Text style={styles.title}>Welcome Back</Text>
                                <Text style={styles.subtitle}>Sign in to access your profile</Text>
                            </View>

                            <View style={styles.form}>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="mail-outline" size={20} color={COLORS.muted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        placeholderTextColor={COLORS.muted}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.muted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        placeholderTextColor={COLORS.muted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.loginButton}
                                    onPress={handleLogin}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={[COLORS.primary, COLORS.primaryBright]}
                                        style={styles.gradientButton}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.loginButtonText}>Log In</Text>
                                        <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.profileScroll}>
                <Animated.View style={[
                    styles.profileContent,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop' }}
                                style={styles.avatar}
                            />
                            <View style={styles.onlineBadge} />
                        </View>
                        <Text style={styles.userName}>{userProfile.name}</Text>
                        <Text style={styles.userBio}>{userProfile.bio}</Text>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={[styles.statCard, { borderColor: 'rgba(0, 255, 133, 0.3)' }]}>
                            <View style={[styles.statIcon, { backgroundColor: 'rgba(0, 255, 133, 0.1)' }]}>
                                <Ionicons name="thumbs-up" size={24} color={COLORS.success} />
                            </View>
                            <Text style={[styles.statNumber, { color: COLORS.success }]}>{userProfile.stats.yes}</Text>
                            <Text style={styles.statLabel}>Vibes Matched</Text>
                        </View>

                        <View style={[styles.statCard, { borderColor: 'rgba(255, 77, 77, 0.3)' }]}>
                            <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 77, 77, 0.1)' }]}>
                                <Ionicons name="thumbs-down" size={24} color={COLORS.error} />
                            </View>
                            <Text style={[styles.statNumber, { color: COLORS.error }]}>{userProfile.stats.no}</Text>
                            <Text style={styles.statLabel}>Skipped</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Ionicons name="settings-outline" size={22} color={COLORS.white} />
                        </View>
                        <Text style={styles.menuText}>Settings</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
                        </View>
                        <Text style={styles.menuText}>Notifications</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.logoutButton]}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SIZES.padding,
    },
    loginContent: {
        width: '100%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(111, 0, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    title: {
        ...FONTS.h1,
        color: COLORS.white,
        marginBottom: 8,
    },
    subtitle: {
        ...FONTS.body,
        color: COLORS.muted,
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radius,
        paddingHorizontal: 15,
        height: 60,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: COLORS.white,
        ...FONTS.body,
    },
    loginButton: {
        marginTop: 20,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        gap: 10,
    },
    loginButtonText: {
        color: COLORS.white,
        ...FONTS.h3,
    },
    // Profile Styles
    profileScroll: {
        padding: SIZES.padding,
        paddingBottom: 100,
    },
    profileContent: {
        width: '100%',
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: COLORS.primary,
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.success,
        borderWidth: 3,
        borderColor: COLORS.background,
    },
    userName: {
        ...FONTS.h1,
        color: COLORS.white,
        marginBottom: 8,
    },
    userBio: {
        ...FONTS.body,
        color: COLORS.muted,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 30,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.card,
        padding: 20,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        borderWidth: 1,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    statNumber: {
        fontSize: 28,
        fontFamily: 'Montserrat-Bold',
        marginBottom: 4,
    },
    statLabel: {
        ...FONTS.body,
        color: COLORS.muted,
        fontSize: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        padding: 16,
        borderRadius: SIZES.radius,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    menuText: {
        flex: 1,
        color: COLORS.white,
        ...FONTS.bodyMedium,
    },
    logoutButton: {
        marginTop: 20,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutText: {
        color: COLORS.error,
        ...FONTS.bodyMedium,
    },
});

export default ProfileScreen;
