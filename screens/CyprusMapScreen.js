import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, StatusBar, Text, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { PROVIDER_DEFAULT, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

const CYPRUS_REGION = {
    latitude: 35.1000, // Slightly adjusted center
    longitude: 33.3823,
    latitudeDelta: 1.8, // Zoom level to see whole island
    longitudeDelta: 1.8,
};

// Placeholder data - User to replace with actual locations
const VENUES = [
    {
        id: 1,
        name: "Guaba Beach Bar",
        coordinate: { latitude: 34.7068, longitude: 33.1095 },
        description: "Famous beach bar known for its wild parties and international DJs.",
        offer: "Free entry before 5 PM",
        event: "Sunday Carnival Party",
        type: "Club"
    },
    {
        id: 2,
        name: "Marina Beach Bar",
        coordinate: { latitude: 34.6685, longitude: 33.0378 },
        description: "Luxury beach experience with exquisite cocktails and dining.",
        offer: "2-for-1 Cocktails 6-8 PM",
        event: "Sunset Chill Sessions",
        type: "Bar"
    },
    {
        id: 3,
        name: "Nicosia Old Town Tavern",
        coordinate: { latitude: 35.1740, longitude: 33.3640 },
        description: "Traditional Cypriot meze in the heart of the capital.",
        offer: "Free dessert with Meze",
        event: "Live Greek Music",
        type: "Restaurant"
    },
    {
        id: 4,
        name: "Ayia Napa Square",
        coordinate: { latitude: 34.9896, longitude: 33.9963 },
        description: "The heart of nightlife with multiple clubs and bars.",
        offer: "Club Pass available",
        event: "Foam Party @ The Castle",
        type: "Club"
    },
    {
        id: 5,
        name: "Teez",
        coordinate: { latitude: 35.169101, longitude: 33.359338 },
        description: "Popular club in the city center.",
        offer: "1 Free Drink",
        event: "Entrance: €10",
        type: "Club"
    },
    {
        id: 6,
        name: "Ithaki Venue",
        coordinate: { latitude: 35.174030, longitude: 33.370621 },
        description: "Open bar venue with great atmosphere.",
        offer: "Open Bar: €15 (Wed)",
        event: "Wednesday Open Bar",
        type: "Bar"
    }
];

const CyprusMapScreen = () => {
    const mapRef = useRef(null);
    const [selectedVenue, setSelectedVenue] = useState(null);

    const handleMarkerPress = (venue) => {
        setSelectedVenue(venue);
    };

    const closeDetails = () => {
        setSelectedVenue(null);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                initialRegion={CYPRUS_REGION}
                minZoomLevel={8.5}
                maxZoomLevel={18}
                rotateEnabled={false}
                pitchEnabled={false}
                customMapStyle={mapStyle}
                showsUserLocation={true}
                showsCompass={false}
                showsPointsOfInterest={false}
                onPress={closeDetails} // Close details when clicking on the map
            >
                {VENUES.map((venue) => (
                    <Marker
                        key={venue.id}
                        coordinate={venue.coordinate}
                        onPress={(e) => {
                            e.stopPropagation(); // Prevent map onPress
                            handleMarkerPress(venue);
                        }}
                    >
                        <View style={styles.markerContainer}>
                            <View style={[styles.markerBubble, { backgroundColor: selectedVenue?.id === venue.id ? COLORS.primary : COLORS.card }]}>
                                <Ionicons
                                    name="location"
                                    size={20}
                                    color={selectedVenue?.id === venue.id ? COLORS.white : COLORS.primary}
                                />
                            </View>
                            <View style={[styles.markerArrow, { borderTopColor: selectedVenue?.id === venue.id ? COLORS.primary : COLORS.card }]} />
                        </View>
                    </Marker>
                ))}
            </MapView>

            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/images/logoreal.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            {/* Details Card */}
            {selectedVenue && (
                <View style={styles.detailsContainer}>
                    <View style={styles.detailsCard}>
                        <View style={styles.detailsHeader}>
                            <Text style={styles.venueName}>{selectedVenue.name}</Text>
                            <TouchableOpacity onPress={closeDetails} style={styles.closeButton}>
                                <Ionicons name="close-circle" size={24} color={COLORS.textDim} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.venueDescription}>{selectedVenue.description}</Text>

                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>OFFER</Text>
                                <Text style={styles.infoText} numberOfLines={1}>{selectedVenue.offer}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>EVENT</Text>
                                <Text style={styles.infoText} numberOfLines={1}>{selectedVenue.event}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    logoContainer: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    logo: {
        width: 100,
        height: 50,
    },
    // Marker Styles
    markerContainer: {
        alignItems: 'center',
    },
    markerBubble: {
        padding: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    markerArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        transform: [{ translateY: -1 }],
    },
    // Details Card Styles
    detailsContainer: {
        position: 'absolute',
        bottom: 100, // Above bottom nav
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        zIndex: 20,
    },
    detailsCard: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radius,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    detailsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    venueName: {
        ...FONTS.h3,
        color: COLORS.text,
        flex: 1,
        marginRight: 10,
    },
    closeButton: {
        marginTop: -4,
        marginRight: -4,
    },
    venueDescription: {
        ...FONTS.body,
        color: COLORS.textDim,
        fontSize: 13,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    infoItem: {
        flex: 1,
    },
    divider: {
        width: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 12,
    },
    infoLabel: {
        ...FONTS.small,
        color: COLORS.primary,
        marginBottom: 4,
        fontSize: 10,
        letterSpacing: 1,
    },
    infoText: {
        ...FONTS.small,
        color: COLORS.text,
        fontFamily: 'Montserrat-SemiBold',
    },
    actionButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        ...FONTS.h4,
        color: COLORS.white,
        fontSize: 14,
    }
});

const mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#1A1A1A" // COLORS.card - Land color
            }
        ]
    },
    {
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1A1A1A"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#9e9e9e"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#bdbdbd"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#181818"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#616161"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1b1b1b"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#2c2c2c"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#8a8a8a"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#373737"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#3c3c3c"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#4e4e4e"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#616161"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#0D0D0D" // COLORS.background - Water color
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#3d3d3d"
            }
        ]
    }
];

export default CyprusMapScreen;
