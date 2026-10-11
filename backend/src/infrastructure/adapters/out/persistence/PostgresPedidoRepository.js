const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

class PostgresPedidoRepository {
  async create(pedido) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        "INSERT INTO pedido (cliente_id, total, estado) VALUES ($1, $2, $3) RETURNING id",
        [pedido.clienteId, pedido.total, pedido.estado]
      );
      const pedidoId = result.rows[0].id;

      for (const item of pedido.items) {
        await client.query(
          "INSERT INTO pedido_item (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)",
          [pedidoId, item.productoId, item.cantidad, item.precio]
        );
      }

      await client.query("COMMIT");
      return pedidoId;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async findById(id) {
    const result = await pool.query(
      `SELECT p.*, json_agg(json_build_object('productoId', pi.producto_id, 'cantidad', pi.cantidad, 'precio', pi.precio_unitario, 'nombre', pr.nombre)) as items
       FROM pedido p
       JOIN pedido_item pi ON p.id = pi.pedido_id
       JOIN producto pr ON pi.producto_id = pr.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = PostgresPedidoRepository;
