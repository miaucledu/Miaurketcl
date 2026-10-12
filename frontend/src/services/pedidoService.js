import { apiCall } from "./apiClient";

export const createPedido = (items, token) =>
  apiCall("POST", "/pedidos", token, { items });

export const getMisPedidos = (token) =>
  apiCall("GET", "/pedidos/mios", token);

export const getVentas = (token) =>
  apiCall("GET", "/pedidos/ventas", token);

export const marcarPagado = (id, token) =>
  apiCall("PATCH", `/pedidos/${id}/pagado`, token);

export const cancelarPedido = (id, token) =>
  apiCall("PATCH", `/pedidos/${id}/cancelado`, token);

export const marcarEnviado = (id, token) =>
  apiCall("PATCH", `/pedidos/${id}/enviado`, token);
