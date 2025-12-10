import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import SearchBar from '../components/SearchBar';
import VenueCard from '../components/VenueCard';
import { fetchTrendingVenues, voteVenue, subscribeVenueStatus, subscribeVenueVotes } from '../lib/supabaseApi';
import { useAuth } from '../lib/authContext';
import { LinearGradient } from 'expo-linear-gradient';

const FILTERS = ['All', 'Chill', 'Party', 'Student Night', 'Near Me'];

const FilterChip = ({ label, active }) => (
    <TouchableOpacity style={[
        styles.chip,
        active && styles.chipActive
    ]}>
        <Text style={[
            styles.chipText,
            active && styles.chipTextActive
        ]}>{label}</Text>
    </TouchableOpacity>
);

const HomeScreen = () => {
    const { user } = useAuth();
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const heroAnim = useRef(new Animated.Value(0)).current;
    const listAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(0)).current;

    const loadVenues = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchTrendingVenues();
            setVenues(data || []);
        } catch (err) {
            console.warn('Failed to load venues', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVenues();
        const votesChannel = subscribeVenueVotes(() => loadVenues());
        const statusChannel = subscribeVenueStatus(() => loadVenues());
        return () => {
            if (votesChannel?.unsubscribe) votesChannel.unsubscribe();
            if (statusChannel?.unsubscribe) statusChannel.unsubscribe();
        };
    }, [loadVenues]);

    useEffect(() => {
        const entry = Animated.parallel([
            Animated.timing(heroAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(listAnim, { toValue: 1, duration: 720, delay: 120, useNativeDriver: true }),
        ]);
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0, duration: 1600, useNativeDriver: true }),
            ])
        );
        entry.start();
        pulse.start();
        return () => pulse.stop();
    }, [heroAnim, listAnim, pulseAnim]);

    const handleVote = async (venueId, status) => {
        try {
            if (!user) {
                Alert.alert('Login required', 'Please log in to vote.');
                return;
            }
            await voteVenue(venueId, status);
        } catch (err) {
            if (err?.code === 'UNAUTHENTICATED') {
                Alert.alert('Login required', 'Please log in to vote.');
                return;
            }
            console.warn('Vote failed', err);
            Alert.alert('Vote failed', 'Something went wrong, please try again.');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadVenues();
        setRefreshing(false);
    };

    const heroTranslate = heroAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [14, 0],
    });

    const listTranslate = listAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 0],
    });

    const glowScale = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.92, 1.08],
    });

    const glowOpacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.08, 0.22],
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <Animated.View style={[styles.heroGlow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
                    <LinearGradient
                        colors={['rgba(111, 0, 255, 0.18)', 'rgba(0, 229, 255, 0.1)', 'rgba(0, 0, 0, 0.4)']}
                        style={styles.logoCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Animated.View style={{ opacity: heroAnim, transform: [{ translateY: heroTranslate }] }}>
                            <Image
                                source={require('../assets/images/logowtgnicosia.png')}
                                style={styles.logo}
                                resizeMode="contain"
                                accessible
                                accessibilityLabel="Where To Go Nicosia logo"
                            />
                            <Text style={styles.subtitle}>Live radar of Nicosia nights</Text>
                            <View style={styles.heroBadges}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>Instant crowd checks</Text>
                                </View>
                                <View style={[styles.badge, styles.badgeSecondary]}>
                                    <Text style={[styles.badgeText, { color: COLORS.background }]}>Map + Events synced</Text>
                                </View>
                            </View>
                        </Animated.View>
                    </LinearGradient>
                </View>

                <SearchBar />

                <Animated.View style={[styles.filterContainer, { opacity: listAnim, transform: [{ translateY: listTranslate }] }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {FILTERS.map((filter, index) => (
                            <FilterChip key={index} label={filter} active={index === 0} />
                        ))}
                    </ScrollView>
                </Animated.View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                >
                    <Animated.View style={{ opacity: listAnim, transform: [{ translateY: listTranslate }] }}>
                        <Text style={styles.sectionTitle}>Trending Tonight</Text>
                    </Animated.View>

                    {loading && (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator color={COLORS.primary} />
                            <Text style={styles.loadingText}>Loading venues...</Text>
                        </View>
                    )}

                    {venues.map((venue) => (
                        <Animated.View
                            key={venue.id}
                            style={[
                                styles.cardWrapper,
                                { opacity: listAnim, transform: [{ translateY: listTranslate }] }
                            ]}
                        >
                            <VenueCard
                                name={venue.name}
                                location={venue.address || venue.city || 'Nicosia'}
                                vibe={venue.crowd_level ? venue.crowd_level.toUpperCase() : 'Vibe'}
                                votes={venue.yes_votes_last24h}
                                isOpen
                                image={venue.cover_url}
                                onVote={() => handleVote(venue.id, 'yes')}
                                disabled={!user}
                            />
                            <View style={styles.voteRow}>
                                {['yes', 'maybe', 'no'].map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        style={[styles.votePill, !user && styles.votePillDisabled]}
                                        onPress={() => handleVote(venue.id, status)}
                                        disabled={!user}
                                    >
                                        <Text style={styles.votePillText}>{status.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Animated.View>
                    ))}

                    {/* Padding for bottom nav */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: SIZES.padding,
    },
    header: {
        marginTop: 10,
        marginBottom: 5,
        position: 'relative',
    },
    logoCard: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 14,
        marginBottom: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
    },
    logo: {
        height: 80,
        width: '85%',
    },
    subtitle: {
        color: COLORS.textDim,
        ...FONTS.body,
        marginTop: 6,
        textAlign: 'center',
    },
    filterContainer: {
        marginBottom: 20,
        height: 40,
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        marginRight: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        color: COLORS.textDim,
        ...FONTS.bodyMedium,
        fontSize: 13,
    },
    chipTextActive: {
        color: COLORS.white,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    sectionTitle: {
        color: COLORS.text,
        ...FONTS.h2,
        marginBottom: 15,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    loadingText: {
        color: COLORS.textDim,
        ...FONTS.body,
    },
    voteRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: -10,
    },
    votePill: {
        backgroundColor: COLORS.card,
        borderColor: COLORS.border,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    votePillDisabled: {
        opacity: 0.5,
    },
    votePillText: {
        color: COLORS.white,
        ...FONTS.bodyMedium,
        fontSize: 12,
    },
    bottomNavContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    heroGlow: {
        position: 'absolute',
        top: -30,
        left: -40,
        right: -40,
        height: 180,
        backgroundColor: COLORS.primary,
        borderRadius: 120,
        opacity: 0.12,
        zIndex: -1,
    },
    heroBadges: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    badgeSecondary: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    badgeText: {
        ...FONTS.small,
        color: COLORS.white,
    },
    cardWrapper: {
        marginBottom: 20,
    },
});

export default HomeScreen;
