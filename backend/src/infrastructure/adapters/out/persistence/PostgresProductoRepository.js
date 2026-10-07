const ProductoRepositoryPort = require("../../../../domain/productoRepositoryPort");
const pool = require("../../../db");
const Producto = require("../../../../domain/entities/Producto");

class PostgresProductoRepository extends ProductoRepositoryPort {
  async findAll() {
    const { rows } = await pool.query(
      "SELECT * FROM producto ORDER BY creado_en DESC"
    );
    return rows.map((r) => Producto.fromRow(r));
  }

  async findById(id) {
    const { rows } = await pool.query(
      "SELECT * FROM producto WHERE id = $1",
      [id]
    );
    if (rows.length === 0) return null;
    return Producto.fromRow(rows[0]);
  }

  async findByVendedorId(vendedor_id) {
    const { rows } = await pool.query(
      "SELECT * FROM producto WHERE vendedor_id = $1",
      [vendedor_id]
    );
    return rows.map((r) => Producto.fromRow(r));
  }

  async findByEstado(estado) {
    const { rows } = await pool.query(
      "SELECT * FROM producto WHERE estado = $1",
      [estado]
    );
    return rows.map((r) => Producto.fromRow(r));
  }

  async create(producto) {
    const result = await pool.query(
      `INSERT INTO producto (nombre, descripcion, precio, imagen_filename, vendedor_id, estado, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [producto.nombre, producto.descripcion, producto.precio, producto.imagen_filename, producto.vendedor_id, producto.estado, producto.creado_en]
    );
    return result.rows[0].id;
  }

  async update(id, producto) {
    await pool.query(
      `UPDATE producto SET nombre = $1, descripcion = $2, precio = $3, imagen_filename = $4 WHERE id = $5`,
      [producto.nombre, producto.descripcion, producto.precio, producto.imagen_filename, id]
    );
    return id;
  }

  async updateEstado(id, estado) {
    await pool.query("UPDATE producto SET estado = $1 WHERE id = $2", [estado, id]);
  }

  async delete(id) {
    await pool.query("DELETE FROM producto WHERE id = $1", [id]);
    return id;
  }
}

module.exports = PostgresProductoRepository;
