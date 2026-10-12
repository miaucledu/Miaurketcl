import { apiCall } from "./apiClient";

export const getDashboard = (token, fechaDesde = null, fechaHasta = null) => {
  const params = new URLSearchParams();
  if (fechaDesde) params.append("fechaDesde", fechaDesde);
  if (fechaHasta) params.append("fechaHasta", fechaHasta);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiCall("GET", `/analytics/dashboard${qs}`, token);
};

export const getTopProductos = (token, limit = 10, fechaDesde = null, fechaHasta = null) => {
  const params = new URLSearchParams();
  params.append("limit", limit);
  if (fechaDesde) params.append("fechaDesde", fechaDesde);
  if (fechaHasta) params.append("fechaHasta", fechaHasta);
  return apiCall("GET", `/analytics/top-productos?${params.toString()}`, token);
};

export const getIngresos = (token, fechaDesde, fechaHasta) =>
  apiCall("GET", `/analytics/ingresos?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`, token);

export const getEstadosPedidos = (token) =>
  apiCall("GET", "/analytics/estados", token);

export const getTicketPromedio = (token, fechaDesde = null, fechaHasta = null) => {
  const params = new URLSearchParams();
  if (fechaDesde) params.append("fechaDesde", fechaDesde);
  if (fechaHasta) params.append("fechaHasta", fechaHasta);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiCall("GET", `/analytics/ticket-promedio${qs}`, token);
};
