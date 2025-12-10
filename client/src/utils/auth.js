// src/utils/auth.js
export const logout = () => {
  try {
    // Clear all auth-related keys
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("providerSession");
    localStorage.removeItem("adminSession");
    localStorage.removeItem("adminToken");
    // If you later store more session keys, clear them here too
  } catch (err) {
    console.error("Error during logout:", err);
  }
};
