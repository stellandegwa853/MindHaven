import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, restore session and validate the token against the server
  useEffect(() => {
    const savedToken = localStorage.getItem("mh_token");
    const savedUser  = localStorage.getItem("mh_user");

    if (!savedToken || !savedUser) {
      setLoading(false);
      return;
    }

    // Optimistically restore state so the UI loads fast
    setToken(savedToken);
    setUser(JSON.parse(savedUser));

    // Validate token against /api/auth/me — if it fails, log out
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Token invalid");
        return res.json();
      })
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem("mh_user", JSON.stringify(freshUser));
      })
      .catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("mh_token");
        localStorage.removeItem("mh_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("mh_token", jwtToken);
    localStorage.setItem("mh_user", JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("mh_token");
    localStorage.removeItem("mh_user");
  }, []);

  // Authenticated fetch wrapper used by all pages
  const authFetch = useCallback(
    (url, options = {}) => {
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      };
      return fetch(`${API_BASE}${url}`, { ...options, headers });
    },
    [token]
  );

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, authFetch, API_BASE }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}