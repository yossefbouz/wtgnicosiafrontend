import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl, ActivityIndicator, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import EventCard from '../components/EventCard';
import { fetchUpcomingEvents, setEventInterest, createBooking } from '../lib/supabaseApi';
import { useAuth } from '../lib/authContext';
import { LinearGradient } from 'expo-linear-gradient';

const ERASMUS_EVENTS = [
    {
        id: 'erasmus-welcome-bash',
        title: 'Erasmus Welcome Bash',
        start_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        venue_name: 'Old Town Rooftop, Nicosia',
        cover_url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1600&auto=format&fit=crop',
        tag: 'Erasmus',
        interested_count: 128,
    },
    {
        id: 'erasmus-beach-escape',
        title: 'Erasmus Sunset Beach Escape',
        start_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        venue_name: 'Fig Tree Bay',
        cover_url: 'https://images.unsplash.com/photo-1470214203634-e436a8848e23?q=80&w=1600&auto=format&fit=crop',
        tag: 'Erasmus',
        interested_count: 94,
    },
    {
        id: 'erasmus-food-crawl',
        title: 'Erasmus Taste of Cyprus Crawl',
        start_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        venue_name: 'Ledra Street Meet-up',
        cover_url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1600&auto=format&fit=crop',
        tag: 'Erasmus',
        interested_count: 72,
    },
];

const EventsScreen = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const heroAnim = useRef(new Animated.Value(0)).current;

    const loadEvents = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchUpcomingEvents();
            setEvents(data || []);
        } catch (err) {
            console.warn('Failed to load events', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    useEffect(() => {
        Animated.timing(heroAnim, {
            toValue: 1,
            duration: 650,
            useNativeDriver: true,
        }).start();
    }, [heroAnim]);

    const handleInterest = async (eventId, status, isPlaceholder) => {
        if (isPlaceholder) {
            Alert.alert('Coming soon', 'RSVPs open once Erasmus hosts finalize the details.');
            return;
        }
        try {
            if (!user) {
                Alert.alert('Login required', 'Please log in to update your interest.');
                return;
            }
            await setEventInterest(eventId, status);
        } catch (err) {
            if (err?.code === 'UNAUTHENTICATED') {
                Alert.alert('Login required', 'Please log in to update your interest.');
                return;
            }
            Alert.alert('Action failed', err.message || 'Please try again');
        }
    };

    const handleBooking = async (eventId, venueId, isPlaceholder) => {
        if (isPlaceholder || !venueId) {
            Alert.alert('Hold tight', 'Bookings open as soon as venues confirm their slots.');
            return;
        }
        try {
            if (!user) {
                Alert.alert('Login required', 'Please log in to book.');
                return;
            }
            await createBooking({ eventId, venueId, partySize: 1 });
            Alert.alert('Booked', 'Your booking is created.');
        } catch (err) {
            if (err?.code === 'UNAUTHENTICATED') {
                Alert.alert('Login required', 'Please log in to book.');
                return;
            }
            Alert.alert('Booking failed', err.message || 'Please try again');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadEvents();
        setRefreshing(false);
    };

    const combinedEvents = useMemo(() => {
        const highlighted = ERASMUS_EVENTS.map((evt) => ({ ...evt, isPlaceholder: true }));
        return [...highlighted, ...(events || [])];
    }, [events]);

    const heroTranslate = heroAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 0],
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <LinearGradient
                    colors={['rgba(111, 0, 255, 0.25)', 'rgba(0, 229, 255, 0.12)', 'transparent']}
                    style={styles.headerGlow}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <Animated.View style={[styles.headerCard, { opacity: heroAnim, transform: [{ translateY: heroTranslate }] }]}>
                    <Text style={styles.kicker}>Curated for Erasmus</Text>
                    <Text style={styles.title}>Upcoming Events</Text>
                    <Text style={styles.subtitle}>Hand-picked Erasmus highlights plus what the city is buzzing about next.</Text>
                </Animated.View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            >
                {loading && (
                    <View style={styles.loadingRow}>
                        <ActivityIndicator color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading events...</Text>
                    </View>
                )}

                {combinedEvents.map((event, index) => (
                    <Animated.View
                        key={event.id || index}
                        style={[
                            styles.cardWrapper,
                            {
                                opacity: heroAnim,
                                transform: [{
                                    translateY: heroAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [18, 0],
                                    })
                                }]
                            }
                        ]}
                    >
                        <EventCard
                            title={event.title}
                            date={event.start_at ? new Date(event.start_at).toDateString() : 'Soon'}
                            venue={event.venue_name || 'Venue'}
                            image={event.cover_url}
                            tag={event.tag}
                            accentColor={event.tag === 'Erasmus' ? COLORS.secondary : COLORS.primary}
                            interestedCount={event.interested_count || 0}
                            onInterested={() => handleInterest(event.id, 'interested', event.isPlaceholder)}
                            onGoing={() => handleInterest(event.id, 'going', event.isPlaceholder)}
                            onBook={() => handleBooking(event.id, event.venue_id, event.isPlaceholder)}
                        />
                    </Animated.View>
                ))}

                {/* Padding for bottom nav */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SIZES.padding,
        paddingTop: 10,
        paddingBottom: 10,
    },
    headerGlow: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.9,
    },
    headerCard: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radius,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    kicker: {
        color: COLORS.secondary,
        ...FONTS.small,
        marginBottom: 4,
    },
    title: {
        color: COLORS.white,
        ...FONTS.h1,
        marginBottom: 4,
    },
    subtitle: {
        color: COLORS.muted,
        ...FONTS.body,
        marginBottom: 4,
    },
    scrollContent: {
        paddingHorizontal: SIZES.padding,
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
    cardWrapper: {
        marginBottom: 20,
    },
});

export default EventsScreen;
