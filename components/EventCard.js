import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const EventCard = ({ title, date, venue, image, interestedCount }) => {
    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.9}>
            <Image source={{ uri: image }} style={styles.image} />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.gradient}
            />

            <View style={styles.content}>
                <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>{date}</Text>
                </View>

                <Text style={styles.title} numberOfLines={2}>{title}</Text>

                <View style={styles.row}>
                    <Ionicons name="location-outline" size={16} color={COLORS.secondary} />
                    <Text style={styles.venue}>{venue}</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.interestedContainer}>
                        <View style={styles.avatars}>
                            {[1, 2, 3].map((_, i) => (
                                <View key={i} style={[styles.avatarPlaceholder, { marginLeft: i > 0 ? -10 : 0 }]} />
                            ))}
                        </View>
                        <Text style={styles.interestedText}>{interestedCount} interested</Text>
                    </View>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Book</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
    },
    content: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 15,
    },
    dateBadge: {
        position: 'absolute',
        top: -160,
        right: 15,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
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
});

export default EventCard;
