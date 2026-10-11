module.exports = function (app, PedidoController, authMiddleware, roleMiddleware) {
  app.post("/pedidos", authMiddleware, roleMiddleware(["pedido", "admin"]), (req, res) => PedidoController.crear(req, res));
  app.get("/pedidos/mios", authMiddleware, roleMiddleware(["pedido", "admin"]), (req, res) => PedidoController.listarMios(req, res));
};
