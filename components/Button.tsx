import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../constants/Colors';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.base,
                styles[variant],
                styles[size],
                (disabled || loading) && styles.disabled,
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.primaryForeground} />
            ) : (
                <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    primary: {
        backgroundColor: Colors.primary
    },
    secondary: {
        backgroundColor: Colors.secondary
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.primary
    },
    small: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        minHeight: 36
    },
    medium: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        minHeight: 48
    },
    large: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        minHeight: 56
    },
    disabled: {
        opacity: 0.5
    },
    text: {
        fontFamily: 'Inter SemiBold',
        fontWeight: '600'
    },
    primaryText: {
        color: Colors.primaryForeground
    },
    secondaryText: {
        color: Colors.secondaryForeground
    },
    outlineText: {
        color: Colors.primary
    },
    smallText: {
        fontSize: 14
    },
    mediumText: {
        fontSize: 16
    },
    largeText: {
        fontSize: 18
    }
});
