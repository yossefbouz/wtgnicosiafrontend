import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Image, StatusBar, Text, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { PROVIDER_DEFAULT, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { useAuth } from '../lib/authContext';
import {
    fetchMapVenues,
    fetchVenueStatus,
    subscribeVenueStatus,
    fetchVenueOccupancy,
    subscribeVenueOccupancy,
    voteVenue,
    fetchUserVenueVotes
} from '../lib/supabaseApi';

const { width } = Dimensions.get('window');

const CYPRUS_REGION = {
    latitude: 35.1000,
    longitude: 33.3823,
    latitudeDelta: 1.8,
    longitudeDelta: 1.8,
};

const CyprusMapScreen = () => {
    const { user } = useAuth();
    const mapRef = useRef(null);
    const [venues, setVenues] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [statusMap, setStatusMap] = useState({});
    const [occupancyMap, setOccupancyMap] = useState({});
    const [userVotes, setUserVotes] = useState({});
    const [loading, setLoading] = useState(true);

    const loadVenues = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchMapVenues();
            setVenues(data || []);

            if (data?.length) {
                const ids = data.map(v => v.id);
                const [statuses, occupancies] = await Promise.all([
                    fetchVenueStatus(ids),
                    fetchVenueOccupancy(ids)
                ]);

                const statusObj = {};
                (statuses || []).forEach(s => { statusObj[s.venue_id] = s; });
                setStatusMap(statusObj);

                const occObj = {};
                (occupancies || []).forEach(o => { occObj[o.venue_id] = o; });
                setOccupancyMap(occObj);
            }
        } catch (err) {
            console.warn('Failed to load map venues', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadUserVotes = useCallback(async () => {
        if (!user) {
            setUserVotes({});
            return;
        }
        try {
            const votes = await fetchUserVenueVotes();
            const map = {};
            votes.forEach(v => {
                map[v.venue_id] = v.status;
            });
            setUserVotes(map);
        } catch (err) {
            console.warn('Failed to load user votes', err);
        }
    }, [user]);

    useEffect(() => {
        loadVenues();
        loadUserVotes();

        const statusChannel = subscribeVenueStatus((payload) => {
            const row = payload.new || payload.old;
            if (row?.venue_id) {
                setStatusMap((prev) => ({ ...prev, [row.venue_id]: { ...(prev[row.venue_id] || {}), ...row } }));
            }
        });

        const occupancyChannel = subscribeVenueOccupancy((payload) => {
            const row = payload.new || payload.old;
            if (row?.venue_id) {
                setOccupancyMap((prev) => ({ ...prev, [row.venue_id]: row }));
            }
        });

        return () => {
            if (statusChannel?.unsubscribe) statusChannel.unsubscribe();
            if (occupancyChannel?.unsubscribe) occupancyChannel.unsubscribe();
        };
    }, [loadVenues, loadUserVotes]);

    const handleVote = async () => {
        if (!selectedVenue) return;
        if (!user) {
            alert('Please log in to vote.');
            return;
        }
        if (userVotes[selectedVenue.id] === 'yes') {
            alert('You already voted yes here.');
            return;
        }
        try {
            await voteVenue(selectedVenue.id, 'yes');
            setUserVotes(prev => ({ ...prev, [selectedVenue.id]: 'yes' }));
        } catch (err) {
            console.warn('Vote failed', err);
            alert('Vote failed, please try again.');
        }
    };

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
                onPress={closeDetails}
            >
                {venues.map((venue) => (
                    <Marker
                        key={venue.id}
                        coordinate={{ latitude: venue.geo_lat, longitude: venue.geo_lng }}
                        onPress={(e) => {
                            e.stopPropagation();
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
                    source={require('../assets/images/logore.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            {loading && (
                <View style={styles.loadingBadge}>
                    <ActivityIndicator color={COLORS.primary} size="small" />
                    <Text style={styles.loadingText}>Loading map...</Text>
                </View>
            )}

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

                        <Text style={styles.venueDescription}>{selectedVenue.address || selectedVenue.city || 'Nicosia'}</Text>

                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>CROWD</Text>
                                <Text style={styles.infoText} numberOfLines={1}>{statusMap[selectedVenue.id]?.crowd_level || 'Unknown'}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>INSIDE</Text>
                                <Text style={styles.infoText} numberOfLines={1}>
                                    {occupancyMap[selectedVenue.id]?.current_count ?? 0}
                                </Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>WAIT</Text>
                                <Text style={styles.infoText} numberOfLines={1}>{statusMap[selectedVenue.id]?.wait_time_minutes ? `${statusMap[selectedVenue.id].wait_time_minutes} min` : '-'}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.actionButton, userVotes[selectedVenue.id] === 'yes' && styles.actionButtonDisabled]}
                            onPress={handleVote}
                            disabled={userVotes[selectedVenue.id] === 'yes'}
                        >
                            <Text style={styles.actionButtonText}>
                                {userVotes[selectedVenue.id] === 'yes' ? 'Voted Yes' : 'Vote Yes'}
                            </Text>
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
        top: 40,
        alignSelf: 'center',
        zIndex: 10,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    logo: {
        width: 150,
        height: 65,
    },
    loadingBadge: {
        position: 'absolute',
        top: 110,
        alignSelf: 'center',
        backgroundColor: COLORS.card,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    loadingText: {
        color: COLORS.textDim,
        ...FONTS.small,
    },
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
    detailsContainer: {
        position: 'absolute',
        bottom: 100,
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
    },
    actionButtonDisabled: {
        opacity: 0.7,
        backgroundColor: COLORS.secondary
    }
});

const mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#1A1A1A"
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
                "color": "#0D0D0D"
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
