module.exports = function (app, PedidoController, authMiddleware, roleMiddleware) {
  app.post("/pedidos", authMiddleware, roleMiddleware(["pedido", "admin"]), (req, res) => PedidoController.crear(req, res));
  app.get("/pedidos/mios", authMiddleware, roleMiddleware(["pedido", "admin"]), (req, res) => PedidoController.listarMios(req, res));
  app.get("/pedidos/ventas", authMiddleware, roleMiddleware(["producto", "admin"]), (req, res) => PedidoController.listarVentas(req, res));
  app.patch("/pedidos/:id/pagado", authMiddleware, roleMiddleware(["pedido", "admin"]), (req, res) => PedidoController.marcarPagado(req, res));
  app.patch("/pedidos/:id/cancelado", authMiddleware, roleMiddleware(["pedido", "admin"]), (req, res) => PedidoController.cancelar(req, res));
  app.patch("/pedidos/:id/enviado", authMiddleware, roleMiddleware(["producto", "admin"]), (req, res) => PedidoController.marcarEnviado(req, res));
};
