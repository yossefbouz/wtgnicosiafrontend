import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl, ActivityIndicator, Alert, Animated, Modal, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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

const BookingModal = ({ visible, onClose, event, onConfirm }) => {
    const [partySize, setPartySize] = useState(1);
    const [contactName, setContactName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!contactName.trim()) {
            Alert.alert('Add your name', 'Please add the name to hold the booking at the venue.');
            return;
        }
        setLoading(true);
        try {
            await onConfirm({
                partySize,
                contactName: contactName.trim(),
            });
            setPartySize(1);
            setContactName('');
        } finally {
            setLoading(false);
        }
    };

    const formattedDate = event?.start_at
        ? new Date(event.start_at).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
        : 'Date TBC';

    useEffect(() => {
        if (!visible) {
            setPartySize(1);
            setContactName('');
        }
    }, [visible, event]);

    if (!event) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <View style={modalStyles.header}>
                    <Text style={modalStyles.modalTitle}>Confirm Booking</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    </View>

                    <Text style={modalStyles.eventName}>{event.title}</Text>
                    <Text style={modalStyles.venueName}>{event.venue_name || 'Venue'}</Text>
                    <View style={modalStyles.contextRow}>
                        <Ionicons name="calendar-outline" size={18} color={COLORS.secondary} />
                        <Text style={modalStyles.contextText}>{formattedDate}</Text>
                    </View>

                    <View style={modalStyles.divider} />

                    <Text style={modalStyles.label}>Name for the booking</Text>
                    <TextInput
                        style={modalStyles.input}
                        value={contactName}
                        onChangeText={setContactName}
                        placeholder="e.g. Maria Georgiou"
                        placeholderTextColor={COLORS.textDim}
                        autoCapitalize="words"
                        returnKeyType="done"
                    />
                    <Text style={modalStyles.helperText}>We share this with the venue so they can hold your spot.</Text>

                    <Text style={modalStyles.label}>Party Size</Text>
                    <View style={modalStyles.counterContainer}>
                        <TouchableOpacity
                            style={[modalStyles.counterBtn, partySize <= 1 && modalStyles.counterBtnDisabled]}
                            onPress={() => setPartySize(Math.max(1, partySize - 1))}
                            disabled={partySize <= 1}
                        >
                            <Ionicons name="remove" size={24} color={COLORS.white} />
                        </TouchableOpacity>

                        <Text style={modalStyles.counterValue}>{partySize}</Text>

                        <TouchableOpacity
                            style={[modalStyles.counterBtn, partySize >= 8 && modalStyles.counterBtnDisabled]}
                            onPress={() => setPartySize(Math.min(8, partySize + 1))}
                            disabled={partySize >= 8}
                        >
                            <Ionicons name="add" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={modalStyles.subtext}>Max 8 people per booking.</Text>

                    <TouchableOpacity
                        style={modalStyles.confirmButton}
                        onPress={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={modalStyles.confirmButtonText}>Confirm & Book</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const EventsScreen = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [recentBooking, setRecentBooking] = useState(null);
    const heroAnim = useRef(new Animated.Value(0)).current;

    // Booking State
    const [showBooking, setShowBooking] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

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

    const initiateBooking = (event) => {
        // Allow booking immediately for all events, including placeholders
        if (!user) {
            Alert.alert('Login required', 'Please log in to book.');
            return;
        }
        setSelectedEvent(event);
        setShowBooking(true);
    };

    const confirmBooking = async ({ partySize, contactName }) => {
        try {
            const booking = await createBooking({
                eventId: selectedEvent?.isPlaceholder ? null : selectedEvent?.id,
                venueId: selectedEvent?.venue_id || null,
                partySize,
                contactName,
            });
            setShowBooking(false);
            setRecentBooking({
                booking,
                eventTitle: selectedEvent.title,
                venueName: selectedEvent.venue_name,
            });
            Alert.alert('Success', 'Your booking has been confirmed! Check your profile for details.');
        } catch (err) {
            console.warn('Booking error', err);
            const friendlyMessage = err?.code === 'PGRST202'
                ? 'We could not reach the booking service. Please try again shortly.'
                : err?.message;
            Alert.alert('Booking failed', friendlyMessage || 'Please try again.');
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
                {recentBooking && (
                    <View style={styles.bookingCard}>
                        <View style={styles.bookingHeader}>
                            <Ionicons name="checkmark-circle" size={22} color={COLORS.secondary} />
                            <Text style={styles.bookingTitle}>Booking sent to venue</Text>
                        </View>
                        <Text style={styles.bookingBody}>{recentBooking.eventTitle || 'Event'}</Text>
                        <Text style={styles.bookingSub}>
                            {recentBooking.booking?.slots_int || recentBooking.booking?.meta?.party_size || '-'} people • {recentBooking.venueName || 'Venue'}
                        </Text>
                        <Text style={styles.bookingHint}>This now shows in the venue bookings table.</Text>
                    </View>
                )}

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
                            onBook={() => initiateBooking(event, event.isPlaceholder)}
                        />
                    </Animated.View>
                ))}

                {/* Padding for bottom nav */}
                <View style={{ height: 100 }} />
            </ScrollView>

            <BookingModal
                visible={showBooking}
                event={selectedEvent}
                onClose={() => setShowBooking(false)}
                onConfirm={confirmBooking}
            />
        </SafeAreaView>
    );
};

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 20
    },
    modalView: {
        width: '100%',
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 25,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        ...FONTS.h2,
        color: COLORS.white,
    },
    eventName: {
        ...FONTS.h3,
        color: COLORS.primary,
        marginBottom: 4,
    },
    venueName: {
        ...FONTS.body,
        color: COLORS.textDim,
        marginBottom: 20,
    },
    contextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    contextText: {
        color: COLORS.textDim,
        ...FONTS.body,
        marginLeft: 8,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginBottom: 20,
    },
    label: {
        ...FONTS.h4,
        color: COLORS.text,
        marginBottom: 10,
    },
    input: {
        width: '100%',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.white,
        marginBottom: 8,
    },
    helperText: {
        color: COLORS.textDim,
        ...FONTS.small,
        marginBottom: 16,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 10,
    },
    counterBtn: {
        backgroundColor: COLORS.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterBtnDisabled: {
        backgroundColor: COLORS.border,
        opacity: 0.5,
    },
    counterValue: {
        ...FONTS.h1,
        color: COLORS.white,
        marginHorizontal: 25,
        minWidth: 30,
        textAlign: 'center',
    },
    subtext: {
        textAlign: 'center',
        color: COLORS.textDim,
        ...FONTS.small,
        marginBottom: 30,
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    confirmButtonText: {
        ...FONTS.h3,
        color: COLORS.white,
    }
});

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
    bookingCard: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radius,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
    },
    bookingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    bookingTitle: {
        ...FONTS.h3,
        color: COLORS.white,
    },
    bookingBody: {
        ...FONTS.bodyMedium,
        color: COLORS.text,
        marginBottom: 4,
    },
    bookingSub: {
        ...FONTS.small,
        color: COLORS.textDim,
        marginBottom: 8,
    },
    bookingHint: {
        ...FONTS.small,
        color: COLORS.secondary,
    },
});

export default EventsScreen;
