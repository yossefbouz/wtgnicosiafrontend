import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const SearchBar = () => {
    return (
        <View style={styles.container}>
            <Ionicons name="search" size={20} color={COLORS.textDim} style={styles.icon} />
            <TextInput
                placeholder="Search bars, clubs, events"
                placeholderTextColor={COLORS.textDim}
                style={styles.input}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.input,
        borderRadius: 50, // Fully rounded corners as per modern spec
        paddingHorizontal: 20,
        paddingVertical: 14,
        marginVertical: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
});

export default SearchBar;
