import { createContext, useContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import { login as loginService } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      // Verificar se o token é válido e não expirou
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Tempo atual em segundos
      
      // Se o token expirou, remove do localStorage
      if (decoded.exp && decoded.exp < currentTime) {
        localStorage.removeItem("token");
        return null;
      }
      
      return decoded;
    } catch (error) {
      // Se houver erro ao decodificar o token, remove do localStorage
      console.error("Erro ao validar token:", error);
      localStorage.removeItem("token");
      return null;
    }
  });

  // Verificar expiração do token periodicamente (a cada 5 minutos)
  useEffect(() => {
    const checkTokenExpiration = () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        // Se o token expirou, faz logout automático
        if (decoded.exp && decoded.exp < currentTime) {
          console.log("Token expirado, fazendo logout automático...");
          logout();
        }
      } catch (error) {
        console.error("Erro ao verificar expiração do token:", error);
        logout();
      }
    };

    // Verificar a cada 5 minutos (300000 ms)
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
    
    // Limpar interval quando componente desmontar
    return () => clearInterval(interval);
  }, []);

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
      
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      return decoded.exp && decoded.exp > currentTime;
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