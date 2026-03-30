import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "marketplace_auth";
const TOKEN_KEY = "marketplace_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const saveSession = ({ token: nextToken, user: nextUser }) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        saveSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
