import { apiCall } from "./apiClient";

export async function crearSolicitud(token, producto_id) {
  return apiCall("POST", "/solicitudes", token, { producto_id });
}

export async function listarMias(token) {
  return apiCall("GET", "/solicitudes/mias", token);
}
