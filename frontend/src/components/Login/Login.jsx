import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Login.module.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await login(formData.username, formData.password);
      const role = user.role; // ou user.authorities[0] dependendo do JWT

      // Redirecionamento por role
      if (role === "ROLE_ADMIN") navigate("/admin");
      else if (role === "ROLE_SOLICITANTE") navigate("/solicitante");
      else if (role === "ROLE_ESCRITORIO") navigate("/escritorio");
      else if (role === "ROLE_APROVADOR") navigate("/aprovador");
      else if (role === "ROLE_EXPANSAO") navigate("/expansao");
      else navigate("/");
    } catch (err) {
      setError(err.message || "Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          💳
          <span className={styles.titulo}> SISTEMA DE PAGAMENTOS</span>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="USUÁRIO"
            className={styles.input}
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            type="password"
            name="password"
            placeholder="SENHA"
            className={styles.input}
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </form>

        <p className={styles.footer}>2026 - Pagamentos App</p>
      </div>
    </div>
  );
}

export default Login;