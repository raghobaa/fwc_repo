// src/utils/auth.js
export async function getCurrentUser() {
  try {
    const res = await fetch("http://localhost:5000/api/auth/user", {
      credentials: "include", // 👈 IMPORTANT for session cookie
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Error fetching user:", err);
    return null;
  }
}
