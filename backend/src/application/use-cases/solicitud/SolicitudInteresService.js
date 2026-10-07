const SolicitudInteres = require("../../../domain/entities/SolicitudInteres");
const SolicitudInteresRepositoryPort = require("../../../domain/solicitudInteresRepositoryPort");
const ProductoRepositoryPort = require("../../../domain/productoRepositoryPort");

class SolicitudInteresService {
  constructor(solicitudRepository, productoRepository) {
    this.solicitudRepository = solicitudRepository;
    this.productoRepository = productoRepository;
  }

  async crear(usuario_id, producto_id) {
    const producto = await this.productoRepository.findById(producto_id);
    if (!producto || !producto.esAprobado()) {
      const error = new Error("El producto no está aprobado");
      error.status = 400;
      throw error;
    }
    const solicitud = new SolicitudInteres(null, usuario_id, producto_id, "interesado", new Date());
    const id = await this.solicitudRepository.create(solicitud);
    return id;
  }

  async listarMias(usuario_id) {
    return await this.solicitudRepository.findByUsuarioId(usuario_id);
  }

  async updateEstado(id, estado) {
    const allowed = ["interesado", "contactado", "cerrado"];
    if (!allowed.includes(estado)) {
      const error = new Error("Estado inválido");
      error.status = 400;
      throw error;
    }
    await this.solicitudRepository.update(id, { estado });
  }

  async delete(id) {
    return await this.solicitudRepository.delete(id);
  }
}

module.exports = SolicitudInteresService;
