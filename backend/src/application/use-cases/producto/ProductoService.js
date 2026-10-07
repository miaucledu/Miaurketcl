const Producto = require("../../../domain/entities/Producto");
const ProductoRepositoryPort = require("../../../domain/productoRepositoryPort");

class ProductoService {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async create(vendedor_id, nombre, descripcion, precio, imagen_filename) {
    const producto = new Producto(null, nombre, descripcion, precio, imagen_filename, vendedor_id, "pendiente", new Date());
    const id = await this.productoRepository.create(producto);
    return id;
  }

  async listarMios(vendedor_id) {
    return await this.productoRepository.findByVendedorId(vendedor_id);
  }

  async listarPendientes() {
    return await this.productoRepository.findByEstado("pendiente");
  }

  async listarAprobados() {
    return await this.productoRepository.findByEstado("aprobado");
  }

  async getById(id) {
    const producto = await this.productoRepository.findById(id);
    if (!producto) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }
    return producto;
  }

  async update(id, vendedor_id, nombre, descripcion, precio, imagen_filename) {
    const existing = await this.productoRepository.findById(id);
    if (!existing) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }
    if (existing.vendedor_id !== vendedor_id) {
      const error = new Error("No autorizado");
      error.status = 403;
      throw error;
    }
    const producto = new Producto(id, nombre, descripcion, precio, imagen_filename, vendedor_id, "pendiente", existing.creado_en);
    return await this.productoRepository.update(id, producto);
  }

  async aprobar(id, estado) {
    const producto = await this.productoRepository.findById(id);
    if (!producto) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }
    await this.productoRepository.updateEstado(id, estado);
  }

  async delete(id, vendedor_id) {
    const existing = await this.productoRepository.findById(id);
    if (!existing) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }
    if (existing.vendedor_id !== vendedor_id) {
      const error = new Error("No autorizado");
      error.status = 403;
      throw error;
    }
    return await this.productoRepository.delete(id);
  }
}

module.exports = ProductoService;
