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

  async findByClienteId(clienteId) {
    const result = await pool.query(
      `SELECT p.id, p.total, p.estado, p.creado_en,
        json_agg(json_build_object(
          'productoId', pi.producto_id,
          'cantidad', pi.cantidad,
          'precio', pi.precio_unitario,
          'nombre', pr.nombre
        )) as items
       FROM pedido p
       JOIN pedido_item pi ON p.id = pi.pedido_id
       JOIN producto pr ON pi.producto_id = pr.id
       WHERE p.cliente_id = $1
       GROUP BY p.id
       ORDER BY p.creado_en DESC`,
      [clienteId]
    );
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      `SELECT p.*, u.email as client_email, u.nombre as client_nombre,
        json_agg(json_build_object(
          'productoId', pi.producto_id,
          'cantidad', pi.cantidad,
          'precio', pi.precio_unitario,
          'nombre', pr.nombre
        )) as items
       FROM pedido p
       JOIN pedido_item pi ON p.id = pi.pedido_id
       JOIN producto pr ON pi.producto_id = pr.id
       JOIN usuario u ON p.cliente_id = u.id
       WHERE p.id = $1
       GROUP BY p.id, u.email, u.nombre`,
      [id]
    );
    return result.rows[0] || null;
  }

  async updateEstado(id, estado) {
    await pool.query("UPDATE pedido SET estado = $1 WHERE id = $2", [estado, id]);
    return id;
  }

  async findByVendedorId(vendedorId) {
    const params = [vendedorId];
    let where = "pr.vendedor_id = $1";
    if (vendedorId === null) {
      params.length = 0;
      where = "TRUE";
    }
    const result = await pool.query(
      `SELECT p.id, p.total, p.estado, p.creado_en,
        u.nombre as client_nombre, u.email as client_email,
        json_agg(json_build_object(
          'productoId', pi.producto_id,
          'cantidad', pi.cantidad,
          'precio', pi.precio_unitario,
          'nombre', pr.nombre
        )) as items
       FROM pedido p
       JOIN pedido_item pi ON p.id = pi.pedido_id
       JOIN producto pr ON pi.producto_id = pr.id
       JOIN usuario u ON p.cliente_id = u.id
       WHERE ${where}
       GROUP BY p.id, u.nombre, u.email
       ORDER BY p.creado_en DESC`,
      params
    );
    return result.rows;
  }

  async productoPerteneceAVendedor(pedidoId, vendedorId) {
    const result = await pool.query(
      `SELECT 1 FROM pedido_item pi
       JOIN producto pr ON pi.producto_id = pr.id
       WHERE pi.pedido_id = $1 AND pr.vendedor_id = $2 LIMIT 1`,
      [pedidoId, vendedorId]
    );
    return result.rows.length > 0;
  }
}

module.exports = PostgresPedidoRepository;
