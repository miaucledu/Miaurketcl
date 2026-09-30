module.exports = function (app, ProductoController, upload, authMiddleware, roleMiddleware) {
  app.post("/productos", authMiddleware, roleMiddleware(["producto", "admin"]), upload, (req, res) => ProductoController.crear(req, res));
  app.get("/productos/mios", authMiddleware, roleMiddleware(["producto", "admin"]), (req, res) => ProductoController.listarMios(req, res));
  app.put("/productos/:id", authMiddleware, roleMiddleware(["producto", "admin"]), upload, (req, res) => ProductoController.actualizar(req, res));
  app.delete("/productos/:id", authMiddleware, roleMiddleware(["producto", "admin"]), (req, res) => ProductoController.eliminar(req, res));
  app.get("/productos/pendientes", authMiddleware, roleMiddleware(["admin"]), (req, res) => ProductoController.listarPendientes(req, res));
  app.patch("/productos/:id/estado", authMiddleware, roleMiddleware(["admin"]), (req, res) => ProductoController.aprobar(req, res));
  app.get("/productos/catalogo", authMiddleware, roleMiddleware(["pedido"]), (req, res) => ProductoController.listarAprobados(req, res));
};
