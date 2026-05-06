import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from "./components/Login/Login";
import MainPage from "./components/MainPage/MainPage";
import "./styles/global.css";  // ✅ ÚNICO ARQUIVO CSS IMPORTADO AQUI
import PrivateRoute from "./routes/PrivateRoute";

// Criar cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;