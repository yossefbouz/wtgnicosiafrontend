import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';

const BottomNav = ({ activeTab, onTabPress }) => {
    return (
        <View style={styles.container}>
            <NavItem
                icon="home"
                label="Home"
                active={activeTab === 'Home'}
                onPress={() => onTabPress('Home')}
            />
            <NavItem
                icon="map-outline"
                label="Map"
                active={activeTab === 'Map'}
                onPress={() => onTabPress('Map')}
            />
            <NavItem
                icon="calendar-outline"
                label="Events"
                active={activeTab === 'Events'}
                onPress={() => onTabPress('Events')}
            />
            <NavItem
                icon="bookmark-outline"
                label="Saved"
                active={activeTab === 'Saved'}
                onPress={() => onTabPress('Saved')}
            />
            <NavItem
                icon="person-outline"
                label="Profile"
                active={activeTab === 'Profile'}
                onPress={() => onTabPress('Profile')}
            />
        </View>
    );
};

const NavItem = ({ icon, label, active, onPress }) => (
    <TouchableOpacity style={styles.tab} onPress={onPress}>
        <Ionicons
            name={icon}
            size={24}
            color={active ? COLORS.secondary : COLORS.muted}
        />
        <Text style={[
            styles.label,
            { color: active ? COLORS.secondary : COLORS.muted }
        ]}>
            {label}
        </Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: COLORS.background,
        height: 85,
        paddingBottom: 25,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 10,
        marginTop: 4,
        fontFamily: 'Inter-Medium',
    },
});

export default BottomNav;
