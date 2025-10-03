"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TextInput, Alert } from "react-native"
import { api } from "@/lib/api"
import { Button } from "@/components/Button"
import { Colors } from "@/constants/Colors"
import { Config } from "@/constants/Config"

export default function OwnerDashboard() {
  const [requests, setRequests] = useState<any[]>([])
  const [offerId, setOfferId] = useState("OFFER_SUMMER15")
  const [redeemCode, setRedeemCode] = useState("")

  const load = async () => {
    try {
      const res = await fetch(`${Config.API_BASE}/api/promotions/requests`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setRequests(data)
    } catch {
      setRequests([])
    }
  }
  useEffect(() => {
    load()
  }, [])

  const approve = async (reviewId: string) => {
    try {
      await api.promotions.approve(reviewId, offerId)
      Alert.alert("Approved", "Promo code generated and sent to promoter.")
      load()
    } catch (e: any) {
      Alert.alert("Error", e.message || "Approval failed")
    }
  }

  const redeem = async () => {
    try {
      await api.promotions.redeem(redeemCode)
      Alert.alert("Success", "Redemption successful!")
      setRedeemCode("")
    } catch (e: any) {
      Alert.alert("Error", e.message || "Redemption failed")
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurant Dashboard</Text>

      <Text style={styles.section}>Pending Promoter Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(x) => x.reviewId}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.username} requests promoter</Text>
            <Text style={styles.cardSub}>Review: {item.reviewText}</Text>
            <Button title="Approve" onPress={() => approve(item.reviewId)} />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.muted}>No requests</Text>}
      />

      <Text style={styles.section}>Redeem Promo</Text>
      <TextInput
        style={styles.input}
        placeholder="Paste encrypted code"
        value={redeemCode}
        onChangeText={setRedeemCode}
        autoCapitalize="none"
      />
      <Button title="Redeem" onPress={redeem} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16, paddingTop: 60 },
  title: { fontSize: 22, fontFamily: "Inter Bold", color: Colors.text.primary, marginBottom: 12 },
  section: { fontSize: 16, color: Colors.text.secondary, marginTop: 16, marginBottom: 8 },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 12, marginBottom: 12 },
  cardTitle: { color: Colors.text.primary, fontFamily: "Inter SemiBold" },
  cardSub: { color: Colors.text.secondary, marginBottom: 8 },
  muted: { color: Colors.text.secondary },
  input: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 8 },
})
