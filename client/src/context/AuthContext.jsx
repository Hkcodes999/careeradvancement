import { createContext, useContext, useEffect, useState } from "react";
import { fetchStudentProfile } from "../services/studentApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔎 Check both storages for existing session
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    const loadUser = async () => {
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // 🔄 If name is missing, try to fetch it
          if (!parsedUser.name && parsedUser.role === "student") {
            try {
              const profileRes = await fetchStudentProfile();
              // Assuming profileRes returns { success: true, profile: { name: "..." }, user: { name: "..." } }
              // OR directly the profile object. Let's assume it returns the user object or profile.
              // Based on StudentProfile.jsx logic, fetchStudentBatchStatus returned { profile: ... }
              // But fetchStudentProfile calls /profile which typically returns user profile data.
              // Let's attempt to get name from the response.
              // We will blindly trust if we find a name field.
              const fetchedName =
                profileRes.name ||
                profileRes.user?.name ||
                profileRes.profile?.name;

              if (fetchedName) {
                const updatedUser = { ...parsedUser, name: fetchedName };
                setUser(updatedUser);
                // Update storage
                const storage = localStorage.getItem("user")
                  ? localStorage
                  : sessionStorage;
                storage.setItem("user", JSON.stringify(updatedUser));
              }
            } catch (err) {
              // Silent fail if profile fetch fails
              console.warn("Could not fetch user name", err);
            }
          }
        } catch (error) {
          console.error("Failed to parse stored user", error);
          logout(); // clear corrupted data
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  /**
   * login function
   * @param {Object} params
   * @param {string} params.token - JWT token from server
   * @param {string} params.role - User role
   * @param {boolean} params.remember - Use localStorage or sessionStorage
   */
  const login = ({ token, role, name, remember }) => {
    if (!token || !role) return;

    // Remove accidental quotes
    const cleanToken = token.replace(/^"|"$/g, "");

    const userData = { role, name };

    const storage = remember ? localStorage : sessionStorage;

    // 🧠 Store session
    storage.setItem("token", cleanToken);
    storage.setItem("user", JSON.stringify(userData));
    storage.setItem("role", role);

    setUser(userData);
  };

  const logout = () => {
    // 🔥 Full cleanup (manual logout OR token expiry)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");

    setUser(null);

    // optional redirect safety
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
