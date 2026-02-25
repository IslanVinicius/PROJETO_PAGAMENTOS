import { api } from "./api";

export async function login(username, password) {
  const response = await api.post("/auth/login", { username, password });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erro no login");
  }

  const data = await response.json();
  const token = data.token; // ajuste conforme sua resposta
  localStorage.setItem("token", token);
  return token;
}