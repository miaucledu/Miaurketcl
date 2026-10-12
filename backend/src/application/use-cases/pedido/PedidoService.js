const Pedido = require("../../../domain/entities/Pedido");

class PedidoService {
  constructor(pedidoRepository, productoRepository, notificationService) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
    this.notificationService = notificationService;
  }

  async crearPedido(usuarioId, items, usuarioEmail, usuarioNombre) {
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

    if (this.notificationService && usuarioEmail) {
      try {
        await this.notificationService.notifyOrderCreated({
          id: pedidoId,
          clientEmail: usuarioEmail,
          clientName: usuarioNombre,
          items: itemsConDetalle,
          total,
          paymentInstructions: "Realiza tu transferencia a la cuenta bancaria: Banco XXX, CTA 1234-5678, CBU 0000000000000000000000",
        });
      } catch (e) {
        console.error("No se pudo enviar la notificación del pedido:", e.message);
      }
    }

    return pedidoId;
  }

  async listarPedidosCliente(usuarioId) {
    return this.pedidoRepository.findByClienteId(usuarioId);
  }

  async listarVentasVendedor(vendedorId, esAdmin = false) {
    return this.pedidoRepository.findByVendedorId(esAdmin ? null : vendedorId);
  }

  async _getPedido(id) {
    const pedido = await this.pedidoRepository.findById(id);
    if (!pedido) {
      const error = new Error("Pedido no encontrado");
      error.status = 404;
      throw error;
    }
    return pedido;
  }

  _error(msg, status) {
    const error = new Error(msg);
    error.status = status;
    throw error;
  }

  async marcarPagado(pedidoId, usuarioId, esAdmin = false) {
    const pedido = await this._getPedido(pedidoId);
    if (!esAdmin && pedido.cliente_id !== usuarioId) this._error("No autorizado", 403);
    if (pedido.estado !== "pendiente_pago") {
      this._error(`Solo se puede marcar como pagado un pedido pendiente de pago (actual: ${pedido.estado})`, 400);
    }
    await this.pedidoRepository.updateEstado(pedidoId, "pagado");
    return { id: pedidoId, estado: "pagado" };
  }

  async cancelarPedido(pedidoId, usuarioId, esAdmin = false) {
    const pedido = await this._getPedido(pedidoId);
    if (!esAdmin && pedido.cliente_id !== usuarioId) this._error("No autorizado", 403);
    if (!["pendiente_pago", "pagado"].includes(pedido.estado)) {
      this._error(`No se puede cancelar un pedido en estado "${pedido.estado}"`, 400);
    }
    await this.pedidoRepository.updateEstado(pedidoId, "cancelado");
    return { id: pedidoId, estado: "cancelado" };
  }

  async marcarEnviado(pedidoId, vendedorId, esAdmin = false) {
    const pedido = await this._getPedido(pedidoId);
    if (!esAdmin) {
      const esDuenio = await this.pedidoRepository.productoPerteneceAVendedor(pedidoId, vendedorId);
      if (!esDuenio) this._error("No autorizado", 403);
    }
    if (pedido.estado !== "pagado") {
      this._error(`Solo se puede enviar un pedido pagado (actual: ${pedido.estado})`, 400);
    }
    await this.pedidoRepository.updateEstado(pedidoId, "enviado");
    return { id: pedidoId, estado: "enviado" };
  }
}

module.exports = PedidoService;
