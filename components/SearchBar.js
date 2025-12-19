import React from 'react';
import { View, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const SearchBar = ({ value, onChangeText, onSubmit, onClear }) => {
    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/images/logore.png')}
                style={styles.logo}
                resizeMode="contain"
                accessible
                accessibilityLabel="WTG Nicosia logo"
            />
            <Ionicons name="search" size={20} color={COLORS.textDim} style={styles.icon} />
            <TextInput
                placeholder="Search bars, clubs, events"
                placeholderTextColor={COLORS.textDim}
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmit}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
            />
            {value?.length > 0 && (
                <TouchableOpacity
                    onPress={onClear}
                    accessibilityRole="button"
                    accessibilityLabel="Clear search"
                    style={styles.clearButton}
                >
                    <Ionicons name="close" size={18} color={COLORS.textDim} />
                </TouchableOpacity>
            )}
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
    logo: {
        width: 28,
        height: 28,
        marginRight: 10,
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
    clearButton: {
        paddingLeft: 8,
        paddingVertical: 4,
    },
});

export default SearchBar;
