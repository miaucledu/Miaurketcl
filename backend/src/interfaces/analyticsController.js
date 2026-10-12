class AnalyticsController {
  constructor(analyticsService) {
    this.analyticsService = analyticsService;
  }

  async getDashboard(req, res) {
    try {
      const { fechaDesde, fechaHasta } = req.query;
      const data = await this.analyticsService.getDashboard(
        fechaDesde || null,
        fechaHasta || null
      );
      res.json(data);
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async getTopProductos(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const { fechaDesde, fechaHasta } = req.query;
      const data = await this.analyticsService.getTopProductos(
        limit,
        fechaDesde || null,
        fechaHasta || null
      );
      res.json(data);
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async getIngresos(req, res) {
    try {
      const { fechaDesde, fechaHasta } = req.query;
      const data = await this.analyticsService.getIngresos(fechaDesde, fechaHasta);
      res.json(data);
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async getEstadosPedidos(req, res) {
    try {
      const data = await this.analyticsService.getEstadosPedidos();
      res.json(data);
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async getTicketPromedio(req, res) {
    try {
      const { fechaDesde, fechaHasta } = req.query;
      const data = await this.analyticsService.getTicketPromedio(
        fechaDesde || null,
        fechaHasta || null
      );
      res.json(data);
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }
}

module.exports = AnalyticsController;
