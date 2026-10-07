class SolicitudInteresController {
  constructor(solicitudService) {
    this.solicitudService = solicitudService;
  }

  async crear(req, res) {
    const { producto_id } = req.body;
    try {
      const id = await this.solicitudService.crear(req.user.id, producto_id);
      res.status(201).json({ msg: "Interés registrado", id });
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async listarMias(req, res) {
    try {
      const solicitudes = await this.solicitudService.listarMias(req.user.id);
      res.json(solicitudes);
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async actualizarEstado(req, res) {
    const { estado } = req.body;
    try {
      await this.solicitudService.updateEstado(req.params.id, estado);
      res.json({ msg: "Estado actualizado" });
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async eliminar(req, res) {
    try {
      await this.solicitudService.delete(req.params.id);
      res.json({ msg: "Solicitud eliminada" });
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }
}

module.exports = SolicitudInteresController;
