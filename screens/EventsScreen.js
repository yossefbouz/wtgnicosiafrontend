import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import EventCard from '../components/EventCard';

const DUMMY_EVENTS = [
    {
        id: 1,
        title: "Neon Jungle Party",
        date: "TONIGHT",
        venue: "Club Teez",
        image: "https://images.unsplash.com/photo-1574100004472-e5363f2f87f3?q=80&w=1000&auto=format&fit=crop",
        interested: 142
    },
    {
        id: 2,
        title: "R&B Fridays",
        date: "FRI 24 NOV",
        venue: "Lost & Found",
        image: "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=1000&auto=format&fit=crop",
        interested: 89
    },
    {
        id: 3,
        title: "Student Night: 50% Off",
        date: "WED 22 NOV",
        venue: "Ithaki Venue",
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop",
        interested: 312
    }
];

const EventsScreen = () => {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <Text style={styles.title}>Upcoming Events</Text>
                <Text style={styles.subtitle}>Don't miss out on the action</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {DUMMY_EVENTS.map(event => (
                    <EventCard
                        key={event.id}
                        title={event.title}
                        date={event.date}
                        venue={event.venue}
                        image={event.image}
                        interestedCount={event.interested}
                    />
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
        paddingBottom: 20,
    },
    title: {
        color: COLORS.white,
        ...FONTS.h1,
    },
    subtitle: {
        color: COLORS.muted,
        ...FONTS.body,
    },
    scrollContent: {
        paddingHorizontal: SIZES.padding,
    },
});

export default EventsScreen;
