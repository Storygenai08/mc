"use client"
import { View, Text, StyleSheet, Alert } from "react-native"
import { useRouter } from "expo-router"
import { Colors } from "../../constants/Colors"
import { useAuthStore } from "../../store/authStore"
import { Button } from "../../components/Button"
import { api } from "@/lib/api"

export default function ProfileScreen() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await api.auth.logout()
          logout()
          router.replace("/(auth)/login")
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase() || "?"}</Text>
          </View>
          <Text style={styles.username}>{user?.username || "User"}</Text>
          <Text style={styles.email}>{user?.email || "user@example.com"}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user?.loyaltyPoints || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user?.level || "Bronze"}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        <Button title="Logout" onPress={handleLogout} variant="outline" style={styles.logoutButton} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: Colors.primary,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter Bold",
    fontWeight: "700",
    color: Colors.primaryForeground,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontFamily: "Inter Bold",
    fontWeight: "700",
    color: Colors.primaryForeground,
  },
  username: {
    fontSize: 24,
    fontFamily: "Inter Bold",
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontFamily: "Inter",
    color: Colors.text.secondary,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 32,
    padding: 16,
    backgroundColor: Colors.secondary,
    borderRadius: 16,
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Inter Bold",
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter",
    color: Colors.text.secondary,
  },
  logoutButton: {
    marginTop: "auto",
  },
})
