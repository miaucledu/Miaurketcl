 class ProductoRepositoryPort {
  async findAll() { throw new Error("Not implemented"); }
  async findById(id) { throw new Error("Not implemented"); }
  async findByVendedorId(vendedor_id) { throw new Error("Not implemented"); }
  async findByEstado(estado) { throw new Error("Not implemented"); }
  async create(producto) { throw new Error("Not implemented"); }
  async update(id, producto) { throw new Error("Not implemented"); }
  async delete(id) { throw new Error("Not implemented"); }
  async updateEstado(id, estado) { throw new Error("Not implemented"); }
}

module.exports = ProductoRepositoryPort;
