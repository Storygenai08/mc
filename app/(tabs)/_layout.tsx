import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.text.muted,
                tabBarStyle: {
                    backgroundColor: Colors.background,
                    borderTopColor: Colors.border.light,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 60
                },
                tabBarLabelStyle: {
                    fontFamily: 'Inter SemiBold',
                    fontSize: 12,
                    fontWeight: '600'
                }
            }}
        >
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="map-outline" size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="create-review"
                options={{
                    title: 'Create Review',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="create-outline" size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="newspaper-outline" size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="feed"
                options={{
                    title: 'Feed',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="newspaper-outline" size={24} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={24} color={color} />
                    )
                }}
            />
        </Tabs>
    );
}