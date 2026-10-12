class PedidoController {
  constructor(pedidoService) {
    this.pedidoService = pedidoService;
  }

  async crear(req, res) {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: "Items requeridos" });
    }
    try {
      const id = await this.pedidoService.crearPedido(req.user.id, items, req.user.email, req.user.nombre);
      res.status(201).json({ msg: "Pedido creado", id });
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async listarMios(req, res) {
    try {
      const pedidos = await this.pedidoService.listarPedidosCliente(req.user.id);
      res.json(pedidos);
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async listarVentas(req, res) {
    try {
      const esAdmin = req.user.rol === "admin";
      const pedidos = await this.pedidoService.listarVentasVendedor(req.user.id, esAdmin);
      res.json(pedidos);
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async marcarPagado(req, res) {
    try {
      const esAdmin = req.user.rol === "admin";
      const result = await this.pedidoService.marcarPagado(req.params.id, req.user.id, esAdmin);
      res.json({ msg: "Pedido marcado como pagado", ...result });
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async cancelar(req, res) {
    try {
      const esAdmin = req.user.rol === "admin";
      const result = await this.pedidoService.cancelarPedido(req.params.id, req.user.id, esAdmin);
      res.json({ msg: "Pedido cancelado", ...result });
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async marcarEnviado(req, res) {
    try {
      const esAdmin = req.user.rol === "admin";
      const result = await this.pedidoService.marcarEnviado(req.params.id, req.user.id, esAdmin);
      res.json({ msg: "Pedido marcado como enviado", ...result });
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }
}

module.exports = PedidoController;
