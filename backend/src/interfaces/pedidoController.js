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
      const id = await this.pedidoService.crearPedido(req.user.id, items);
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
}

module.exports = PedidoController;
