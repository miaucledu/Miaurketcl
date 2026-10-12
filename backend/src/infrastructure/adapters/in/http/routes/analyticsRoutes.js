module.exports = function (app, AnalyticsController, authMiddleware, roleMiddleware) {
  app.get("/analytics/dashboard", authMiddleware, roleMiddleware(["admin"]), (req, res) => AnalyticsController.getDashboard(req, res));
  app.get("/analytics/top-productos", authMiddleware, roleMiddleware(["admin"]), (req, res) => AnalyticsController.getTopProductos(req, res));
  app.get("/analytics/ingresos", authMiddleware, roleMiddleware(["admin"]), (req, res) => AnalyticsController.getIngresos(req, res));
  app.get("/analytics/estados", authMiddleware, roleMiddleware(["admin"]), (req, res) => AnalyticsController.getEstadosPedidos(req, res));
  app.get("/analytics/ticket-promedio", authMiddleware, roleMiddleware(["admin"]), (req, res) => AnalyticsController.getTicketPromedio(req, res));
};
