import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Font from 'expo-font';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        // Load custom fonts
        Font.loadAsync({
            GeistSans: require('C:/Users/ganes/Downloads/foodie/assets/fonts/GeistSans.ttf'),
            GeistMono: require('C:/Users/ganes/Downloads/foodie/assets/fonts/GeistMono.ttf'),
        }).then(() => setFontsLoaded(true));
    }, []);

    if (!fontsLoaded) return null;

    return (
        <View style={styles.container}>
            {children}
            <Text style={{ fontFamily: 'GeistSans', fontSize: 16 }}>Example GeistSans Text</Text>
            <Text style={{ fontFamily: 'GeistMono', fontSize: 16 }}>Example GeistMono Text</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
