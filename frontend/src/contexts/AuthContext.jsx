import { createContext, useContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import { login as loginService } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      // Decodificar o token sem verificar expiração
      const decoded = jwtDecode(token);
      
      return decoded;
    } catch (error) {
      // Se houver erro ao decodificar o token, remove do localStorage
      console.error("Erro ao validar token:", error);
      localStorage.removeItem("token");
      return null;
    }
  });



  async function login(username, password) {
    try {
      const token = await loginService(username, password);
      const decoded = jwtDecode(token);
      setUser(decoded);
      return decoded; // 👈 importante para o componente usar
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    // Redirecionar para login
    window.location.href = '/login';
  }

  // Função para verificar manualmente se o token é válido
  function isTokenValid() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      
      // Apenas verifica se o token pode ser decodificado
      jwtDecode(token);
      return true;
    } catch (error) {
      return false;
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isTokenValid }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);