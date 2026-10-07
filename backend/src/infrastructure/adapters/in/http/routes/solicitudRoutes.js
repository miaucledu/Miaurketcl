module.exports = function (app, SolicitudController, authMiddleware, roleMiddleware) {
  app.post("/solicitudes", authMiddleware, roleMiddleware(["pedido"]), (req, res) => SolicitudController.crear(req, res));
  app.get("/solicitudes/mias", authMiddleware, roleMiddleware(["pedido"]), (req, res) => SolicitudController.listarMias(req, res));
  app.patch("/solicitudes/:id/estado", authMiddleware, roleMiddleware(["pedido"]), (req, res) => SolicitudController.actualizarEstado(req, res));
  app.delete("/solicitudes/:id", authMiddleware, roleMiddleware(["pedido"]), (req, res) => SolicitudController.eliminar(req, res));
};

