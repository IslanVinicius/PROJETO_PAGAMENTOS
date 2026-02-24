import api from "./api";

export async function login(username, password) {
  const response = await api.post("/auth/login", {
    username,
    password,
  });

  const token = response.data.token;

  localStorage.setItem("token", token);

  return token;
}