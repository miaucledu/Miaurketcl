class Pedido {
  constructor(id, clienteId, items, total, estado, creadoEn = new Date()) {
    this.id = id;
    this.clienteId = clienteId;
    this.items = items;
    this.total = total;
    this.estado = estado;
    this.creadoEn = creadoEn;
  }
}

module.exports = Pedido;
