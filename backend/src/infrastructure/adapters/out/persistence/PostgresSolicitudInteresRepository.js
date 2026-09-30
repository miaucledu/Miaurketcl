const SolicitudInteresRepositoryPort = require("../../../../domain/solicitudInteresRepositoryPort");
const pool = require("../../../db");
const SolicitudInteres = require("../../../../domain/entities/SolicitudInteres");

class PostgresSolicitudInteresRepository extends SolicitudInteresRepositoryPort {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT s.*, p.nombre as producto_nombre FROM solicitud_interes s
       JOIN producto p ON s.producto_id = p.id ORDER BY s.creado_en DESC`
    );
    return rows.map((r) => SolicitudInteres.fromRow(r));
  }

  async findByUsuarioId(usuario_id) {
    const { rows } = await pool.query(
      "SELECT * FROM solicitud_interes WHERE usuario_id = $1",
      [usuario_id]
    );
    return rows.map((r) => SolicitudInteres.fromRow(r));
  }

  async findByProductoId(producto_id) {
    const { rows } = await pool.query(
      "SELECT * FROM solicitud_interes WHERE producto_id = $1",
      [producto_id]
    );
    return rows.map((r) => SolicitudInteres.fromRow(r));
  }

  async create(solicitud) {
    const result = await pool.query(
      `INSERT INTO solicitud_interes (usuario_id, producto_id, estado, creado_en)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [solicitud.usuario_id, solicitud.producto_id, solicitud.estado, solicitud.creado_en]
    );
    return result.rows[0].id;
  }

  async update(id, solicitud) {
    await pool.query(
      "UPDATE solicitud_interes SET estado = $1 WHERE id = $2",
      [solicitud.estado, id]
    );
    return id;
  }

  async delete(id) {
    await pool.query("DELETE FROM solicitud_interes WHERE id = $1", [id]);
    return id;
  }
}

module.exports = PostgresSolicitudInteresRepository;
