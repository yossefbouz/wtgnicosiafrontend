import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const VenueCard = ({ name, location, vibe, votes, image, isOpen, onVote }) => {
    return (
        <TouchableOpacity activeOpacity={0.9} style={styles.container}>
            <ImageBackground source={{ uri: image }} style={styles.image} imageStyle={styles.imageRadius}>
                <LinearGradient
                    colors={['transparent', 'rgba(13, 13, 13, 0.95)']}
                    style={styles.gradient}
                >
                    <View style={styles.topRow}>
                        <View style={styles.vibeTag}>
                            <Text style={styles.vibeText}>{vibe}</Text>
                        </View>
                        <View style={[styles.statusTag, { backgroundColor: isOpen ? COLORS.success : COLORS.error }]}>
                            <Text style={styles.statusText}>{isOpen ? 'OPEN' : 'CLOSED'}</Text>
                        </View>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.name}>{name}</Text>
                        <Text style={styles.location}>{location}</Text>

                        <View style={styles.footer}>
                            <View style={styles.voteContainer}>
                                <Text style={styles.voteCount}>{votes}</Text>
                                <Text style={styles.voteLabel}>going</Text>
                            </View>

                            <TouchableOpacity style={styles.voteButton} onPress={onVote}>
                                <Text style={styles.voteButtonText}>Vote Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 240,
        marginBottom: 20,
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageRadius: {
        borderRadius: SIZES.radius,
    },
    gradient: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 15,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    vibeTag: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    vibeText: {
        color: COLORS.primary,
        ...FONTS.small,
        fontFamily: 'Montserrat-SemiBold',
    },
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: COLORS.background,
        fontSize: 10,
        fontFamily: 'Montserrat-Bold',
    },
    content: {
        justifyContent: 'flex-end',
    },
    name: {
        color: COLORS.text,
        ...FONTS.h2,
        marginBottom: 2,
    },
    location: {
        color: COLORS.textDim,
        ...FONTS.body,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    voteContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    voteCount: {
        color: COLORS.secondary,
        fontSize: 20,
        fontFamily: 'Montserrat-Bold',
        marginRight: 4,
        textShadowColor: COLORS.secondary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    voteLabel: {
        color: COLORS.textDim,
        ...FONTS.small,
    },
    voteButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    voteButtonText: {
        color: COLORS.white,
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 12,
    },
});

export default VenueCard;
