import { apiCall } from "./apiClient";

export const createPedido = (items, token) =>
  apiCall("POST", "/pedidos", token, { items });

export const getMisPedidos = (token) =>
  apiCall("GET", "/pedidos/mios", token);
