class AnalyticsRepositoryPort {
  async getTopProductos(limit = 10, fechaDesde = null, fechaHasta = null) {
    throw new Error("Not implemented");
  }
  async getIngresosPorPeriodo(fechaDesde, fechaHasta) {
    throw new Error("Not implemented");
  }
  async getIngresosDiarios(fechaDesde, fechaHasta) {
    throw new Error("Not implemented");
  }
  async getDistribucionEstados() {
    throw new Error("Not implemented");
  }
  async getTicketPromedio(fechaDesde = null, fechaHasta = null) {
    throw new Error("Not implemented");
  }
  async getResumenGeneral(fechaDesde = null, fechaHasta = null) {
    throw new Error("Not implemented");
  }
}

module.exports = AnalyticsRepositoryPort;
