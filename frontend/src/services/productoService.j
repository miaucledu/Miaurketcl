import { apiCall } from "./apiClient";

export async function crearProducto(token, data) {
  return apiCall("POST", "/productos", token, data);
}

export async function listarMios(token) {
  return apiCall("GET", "/productos/mios", token);
}

export async function listarPendientes(token) {
  return apiCall("GET", "/productos/pendientes", token);
}

export async function listarCatalogo(token) {
  return apiCall("GET", "/productos/catalogo", token);
}

export async function actualizarProducto(token, id, data) {
  return apiCall("PUT", `/productos/${id}`, token, data);
}

export async function aprobarProducto(token, id, estado) {
  return apiCall("PATCH", `/productos/${id}/estado`, token, { estado });
}

export async function eliminarProducto(token, id) {
  return apiCall("DELETE", `/productos/${id}`, token);
}
