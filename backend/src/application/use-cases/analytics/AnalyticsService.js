class AnalyticsService {
  constructor(analyticsRepository) {
    this.analyticsRepository = analyticsRepository;
  }

  async getTopProductos(limit = 10, fechaDesde = null, fechaHasta = null) {
    return await this.analyticsRepository.getTopProductos(limit, fechaDesde, fechaHasta);
  }

  async getIngresos(fechaDesde, fechaHasta) {
    if (!fechaDesde || !fechaHasta) {
      const error = new Error("Se requieren fechaDesde y fechaHasta");
      error.status = 400;
      throw error;
    }
    const [resumen, diarios] = await Promise.all([
      this.analyticsRepository.getIngresosPorPeriodo(fechaDesde, fechaHasta),
      this.analyticsRepository.getIngresosDiarios(fechaDesde, fechaHasta),
    ]);
    return {
      total: parseFloat(resumen.total),
      cantidad_pedidos: parseInt(resumen.cantidad_pedidos, 10),
      serie_diaria: diarios.map((d) => ({
        fecha: d.fecha,
        total: parseFloat(d.total),
        pedidos: parseInt(d.cantidad_pedidos, 10),
      })),
    };
  }

  async getEstadosPedidos() {
    return await this.analyticsRepository.getDistribucionEstados();
  }

  async getTicketPromedio(fechaDesde = null, fechaHasta = null) {
    return await this.analyticsRepository.getTicketPromedio(fechaDesde, fechaHasta);
  }

  async getDashboard(fechaDesde = null, fechaHasta = null) {
    const [resumen, topProductos, estados, ticket] = await Promise.all([
      this.analyticsRepository.getResumenGeneral(fechaDesde, fechaHasta),
      this.analyticsRepository.getTopProductos(10, fechaDesde, fechaHasta),
      this.analyticsRepository.getDistribucionEstados(),
      this.analyticsRepository.getTicketPromedio(fechaDesde, fechaHasta),
    ]);
    return {
      ingresos_totales: parseFloat(resumen.ingresos_totales),
      total_pedidos: parseInt(resumen.total_pedidos, 10),
      ticket_promedio: parseFloat(resumen.ticket_promedio),
      top_productos: topProductos,
      estados_pedidos: estados,
      ticket: ticket,
    };
  }
}

module.exports = AnalyticsService;
