export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Foodie&apos;s Circle</h1>
      <p style={{ color: "#555", marginBottom: 16 }}>
        This is the web preview entry. Use the mobile tabs (Explore, Feed, Profile) via the Expo routes in the preview,
        and ensure Config.API_BASE points to your Flask backend.
      </p>
      <ul style={{ lineHeight: 1.6, color: "#333" }}>
        <li>Login/Sign Up in /(auth)</li>
        <li>Explore nearby restaurants and open their profile</li>
        <li>Create reviews with photos and request promoter status</li>
        <li>Restaurant owners can approve and redeem promo codes</li>
      </ul>
    </main>
  )
}
