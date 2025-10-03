import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../constants/Colors';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[styles.input, error && styles.inputError, style]}
                placeholderTextColor={Colors.text.muted}
                {...props}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16
    },
    label: {
        fontSize: 14,
        fontFamily: 'Inter SemiBold',
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 8
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.border.medium,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'Inter',
        color: Colors.text.primary,
        backgroundColor: Colors.background,
        minHeight: 48
    },
    inputError: {
        borderColor: Colors.status.error
    },
    error: {
        fontSize: 12,
        fontFamily: 'Inter',
        color: Colors.status.error,
        marginTop: 4
    }
});
