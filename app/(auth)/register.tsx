"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useRouter } from "expo-router"
import { Colors } from "../../constants/Colors"
import { Button } from "../../components/Button"
import { Input } from "../../components/Input"
import { api } from "@/lib/api"
import { useAuthStore } from "../../store/authStore"

export default function RegisterScreen() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<"foodie" | "restaurant">("foodie")
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters")
      return
    }
    setLoading(true)
    try {
      if (userType === "restaurant") {
        await api.auth.registerRestaurant(username, email, password)
      } else {
        await api.auth.registerFoodie(username, email, password)
      }
      router.replace("/(tabs)")
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message || "Could not create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.emoji}>🍽️</Text>
          <Text style={styles.title}>Join Foodie's Circle</Text>
          <Text style={styles.subtitle}>Start your culinary adventure today</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, userType === "foodie" && styles.typeButtonActive]}
              onPress={() => setUserType("foodie")}
            >
              <Text style={[styles.typeButtonText, userType === "foodie" && styles.typeButtonTextActive]}>
                🍔 Foodie
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, userType === "restaurant" && styles.typeButtonActive]}
              onPress={() => setUserType("restaurant")}
            >
              <Text style={[styles.typeButtonText, userType === "restaurant" && styles.typeButtonTextActive]}>
                🏪 Restaurant
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="foodielover"
            autoCapitalize="none"
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

          <Button title="Create Account" onPress={handleRegister} loading={loading} style={styles.button} />

          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.link}>
              Already have an account? <Text style={styles.linkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter Bold",
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter",
    color: Colors.text.secondary,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  typeSelector: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    backgroundColor: Colors.background,
    alignItems: "center",
  },
  typeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.secondary,
  },
  typeButtonText: {
    fontSize: 16,
    fontFamily: "Inter SemiBold",
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  typeButtonTextActive: {
    color: Colors.primary,
  },
  button: {
    marginTop: 8,
    marginBottom: 24,
  },
  link: {
    fontSize: 14,
    fontFamily: "Inter",
    color: Colors.text.secondary,
    textAlign: "center",
  },
  linkBold: {
    fontFamily: "Inter SemiBold",
    fontWeight: "600",
    color: Colors.primary,
  },
})
