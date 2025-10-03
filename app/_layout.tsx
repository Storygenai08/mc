"use client"

import { useEffect } from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useFrameworkReady } from "@/hooks/useFrameworkReady"
// import blink from '../blink/client';
import { useAuthStore } from "../store/authStore"

export default function RootLayout() {
  useFrameworkReady()
  const { /* setUser, */ setLoading } = useAuthStore()

  useEffect(() => {
    // Set loading false after initial mount; per-screen will fetch 'me' as needed
    setLoading(false)
  }, [])

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(owner)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  )
}
