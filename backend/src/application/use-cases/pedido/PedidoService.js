const Pedido = require("../../../domain/entities/Pedido");

class PedidoService {
  constructor(pedidoRepository, productoRepository, notificationService) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
    this.notificationService = notificationService;
  }

  async crearPedido(usuarioId, items) {
    const itemsConDetalle = [];
    let total = 0;

    for (const item of items) {
      const producto = await this.productoRepository.findById(item.productoId);
      if (!producto) {
        const error = new Error(`Producto ${item.productoId} no encontrado`);
        error.status = 404;
        throw error;
      }
      if (!producto.esAprobado()) {
        const error = new Error(`Producto ${producto.nombre} no está aprobado`);
        error.status = 400;
        throw error;
      }
      const precio = Number(producto.precio);
      const cantidad = item.cantidad || 1;
      itemsConDetalle.push({
        productoId: producto.id,
        nombre: producto.nombre,
        cantidad,
        precio,
      });
      total += precio * cantidad;
    }

    const pedido = new Pedido(null, usuarioId, itemsConDetalle, total, "pendiente_pago");
    const pedidoId = await this.pedidoRepository.create(pedido);

    if (this.notificationService) {
      const pedidoCompleto = await this.pedidoRepository.findById(pedidoId);
      console.log("DEBUG pedidoCompleto:", JSON.stringify(pedidoCompleto));
      await this.notificationService.notifyOrderCreated({
        id: pedidoId,
        clientEmail: pedidoCompleto.client_email,
        clientName: pedidoCompleto.client_nombre,
        items: itemsConDetalle,
        total,
        paymentInstructions: "Realiza tu transferencia a la cuenta bancaria: Banco XXX, CTA 1234-5678, CBU 0000000000000000000000",
      });
    }

    return pedidoId;
  }

  async listarPedidosCliente(usuarioId) {
    return this.pedidoRepository.findByClienteId(usuarioId);
  }
}

module.exports = PedidoService;
