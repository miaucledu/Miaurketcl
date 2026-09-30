import { apiCall } from "./apiClient";

export async function login(email, password, captchaId, respuesta) {
  return apiCall("POST", "/auth/login", null, { email, password, captchaId, respuesta });
}

export async function register(nombre, email, password, captchaId, respuesta) {
  return apiCall("POST", "/auth/registro", null, { nombre, email, password, captchaId, respuesta });
}

export async function getCaptcha() {
  return apiCall("GET", "/auth/captcha");
}
