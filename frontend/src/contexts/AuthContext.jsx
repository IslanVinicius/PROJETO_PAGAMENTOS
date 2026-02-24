import { createContext, useContext, useState } from "react";
import jwtDecode from "jwt-decode";
import { login as loginService } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    return jwtDecode(token);
  });

  async function login(username, password) {
    const token = await loginService(username, password);
    const decoded = jwtDecode(token);
    setUser(decoded);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);