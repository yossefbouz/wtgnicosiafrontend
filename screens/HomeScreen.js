import React from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import SearchBar from '../components/SearchBar';
import VenueCard from '../components/VenueCard';


const DUMMY_VENUES = [
    {
        id: 1,
        name: 'Club Teez',
        location: 'Evagorou Ave, Nicosia',
        vibe: 'Packed',
        votes: 142,
        isOpen: true,
        image: 'https://images.unsplash.com/photo-1574100004472-e5363f2f87f3?q=80&w=1000&auto=format&fit=crop',
    },
    {
        id: 2,
        name: 'Lost & Found Drinkery',
        location: 'Vyronos Ave, Nicosia',
        vibe: 'Chill',
        votes: 89,
        isOpen: true,
        image: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1000&auto=format&fit=crop',
    },
    {
        id: 3,
        name: 'Ithaki Venue',
        location: 'Old Nicosia',
        vibe: 'Student Night',
        votes: 205,
        isOpen: false,
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop',
    },
];

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
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Where To Go</Text>
                    <Text style={styles.subtitle}>Find the vibe tonight</Text>
                </View>

                <SearchBar />

                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {FILTERS.map((filter, index) => (
                            <FilterChip key={index} label={filter} active={index === 0} />
                        ))}
                    </ScrollView>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Text style={styles.sectionTitle}>Trending Tonight</Text>

                    {DUMMY_VENUES.map((venue) => (
                        <VenueCard
                            key={venue.id}
                            name={venue.name}
                            location={venue.location}
                            vibe={venue.vibe}
                            votes={venue.votes}
                            isOpen={venue.isOpen}
                            image={venue.image}
                        />
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
    },
    title: {
        color: COLORS.primary,
        ...FONTS.h1,
    },
    subtitle: {
        color: COLORS.textDim,
        ...FONTS.body,
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
    bottomNavContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
});

export default HomeScreen;
