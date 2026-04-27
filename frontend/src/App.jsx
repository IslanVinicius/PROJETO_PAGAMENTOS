import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login/Login";
import MainPage from "./components/MainPage/MainPage";
import "./styles/global.css";  // ✅ ÚNICO ARQUIVO CSS IMPORTADO AQUI
import PrivateRoute from "./routes/PrivateRoute";

// Componente para rotas protegidas
function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<PrivateRoute><MainPage /></PrivateRoute>} />
      <Route path="/solicitante" element={<PrivateRoute><MainPage /></PrivateRoute>} />
      <Route path="/escritorio" element={<PrivateRoute><MainPage /></PrivateRoute>} />
      <Route path="/aprovador" element={<PrivateRoute><MainPage /></PrivateRoute>} />
      <Route path="/expansao" element={<PrivateRoute><MainPage /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;