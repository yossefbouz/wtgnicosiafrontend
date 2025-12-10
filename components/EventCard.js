import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const EventCard = ({ title, date, venue, image, interestedCount, onInterested, onGoing, onBook, tag, accentColor }) => {
    const posterSource = image ? { uri: image } : require('../assets/images/logowtgnicosia.png');
    const pillColor = accentColor || COLORS.secondary;

    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.9}>
            <ImageBackground source={posterSource} style={styles.image} imageStyle={styles.imageRadius}>
                <LinearGradient
                    colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.9)']}
                    style={styles.gradient}
                >
                    <View style={styles.topRow}>
                        {tag && (
                            <View style={[styles.tagBadge, { borderColor: pillColor, backgroundColor: 'rgba(0, 229, 255, 0.12)' }]}>
                                <Text style={[styles.tagText, { color: pillColor }]}>{tag}</Text>
                            </View>
                        )}
                        <View style={styles.dateBadge}>
                            <Text style={styles.dateText}>{date}</Text>
                        </View>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title} numberOfLines={2}>{title}</Text>

                        <View style={styles.row}>
                            <Ionicons name="location-outline" size={16} color={COLORS.secondary} />
                            <Text style={styles.venue} numberOfLines={1}>{venue}</Text>
                        </View>

                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.interestedContainer} onPress={onInterested} activeOpacity={0.8}>
                                <View style={styles.avatars}>
                                    {[1, 2, 3].map((_, i) => (
                                        <View key={i} style={[styles.avatarPlaceholder, { marginLeft: i > 0 ? -10 : 0 }]} />
                                    ))}
                                </View>
                                <Text style={styles.interestedText}>{interestedCount} interested</Text>
                            </TouchableOpacity>

                            <View style={styles.actionsRow}>
                                <TouchableOpacity style={styles.secondaryButton} onPress={onGoing} activeOpacity={0.85}>
                                    <Text style={styles.secondaryButtonText}>Going</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={onBook} activeOpacity={0.9}>
                                    <Text style={styles.actionButtonText}>Book</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 250,
        marginBottom: 20,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
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
        padding: 15,
        justifyContent: 'space-between',
    },
    content: {
        width: '100%',
        paddingBottom: 4,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    dateText: {
        color: COLORS.white,
        ...FONTS.h3,
        fontSize: 14,
    },
    title: {
        color: COLORS.white,
        ...FONTS.h2,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 4,
    },
    venue: {
        color: COLORS.secondary,
        ...FONTS.bodyMedium,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    interestedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 4,
        paddingRight: 8,
    },
    avatars: {
        flexDirection: 'row',
    },
    avatarPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.muted,
        borderWidth: 2,
        borderColor: COLORS.card,
    },
    interestedText: {
        color: COLORS.textDim,
        ...FONTS.small,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    actionButton: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    actionButtonText: {
        color: COLORS.background,
        ...FONTS.h3,
        fontSize: 14,
    },
    secondaryButton: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    secondaryButtonText: {
        color: COLORS.white,
        ...FONTS.bodyMedium,
        fontSize: 13,
    },
    tagBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 1,
    },
    tagText: {
        ...FONTS.small,
        fontSize: 12,
        fontFamily: 'Montserrat-SemiBold',
        letterSpacing: 0.5,
    },
});

export default EventCard;
