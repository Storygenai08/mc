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

export default function LoginScreen() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      await api.auth.login(email, password)
      router.replace("/(tabs)")
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.emoji}>🍽️</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your foodie journey</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

          <Button title="Sign In" onPress={handleLogin} loading={loading} style={styles.button} />

          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.link}>
              Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
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
    marginBottom: 48,
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
