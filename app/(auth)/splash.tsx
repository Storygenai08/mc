"use client"

import { useEffect } from "react"
import { View, Text, StyleSheet, Animated } from "react-native"
import { useRouter } from "expo-router"
import { Colors } from "../../constants/Colors"
import { api } from "@/lib/api"
import { useAuthStore } from "../../store/authStore"

export default function SplashScreen() {
  const router = useRouter()
  const { setUser, setLoading } = useAuthStore()
  const fadeAnim = new Animated.Value(0)
  const scaleAnim = new Animated.Value(0.8)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start()

    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // attempt to fetch current user if token exists
      try {
        const me = await api.auth.me()
        if (me) {
          setUser(me as any)
          router.replace("/(tabs)")
          return
        }
      } catch {
        // not logged in
      }
      setTimeout(() => router.replace("/(auth)/login"), 1200)
    } catch (error) {
      console.error("Auth check failed:", error)
      setTimeout(() => router.replace("/(auth)/login"), 1200)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.emoji}>🍽️</Text>
        </View>
        <Text style={styles.title}>Foodie's Circle</Text>
        <Text style={styles.tagline}>Discover. Review. Reward.</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: Colors.primaryForeground,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter Bold",
    fontWeight: "700",
    color: Colors.primaryForeground,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Inter",
    color: Colors.primaryForeground,
    opacity: 0.9,
  },
})
