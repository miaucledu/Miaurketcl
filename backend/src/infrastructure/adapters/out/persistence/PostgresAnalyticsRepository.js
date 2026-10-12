const AnalyticsRepositoryPort = require("../../../../domain/analyticsRepositoryPort");
const pool = require("../../../db");

class PostgresAnalyticsRepository extends AnalyticsRepositoryPort {
  async getTopProductos(limit = 10, fechaDesde = null, fechaHasta = null) {
    let query = `
      SELECT
        p.id,
        p.nombre,
        p.precio,
        COALESCE(SUM(pi.cantidad), 0) AS unidades_vendidas,
        COALESCE(SUM(pi.cantidad * pi.precio_unitario), 0) AS monto_recaudado
      FROM producto p
      LEFT JOIN pedido_item pi ON pi.producto_id = p.id
      LEFT JOIN pedido pe ON pe.id = pi.pedido_id AND pe.estado != 'cancelado'
    `;
    const params = [];
    const conditions = [];
    if (fechaDesde) {
      params.push(fechaDesde);
      conditions.push(`pe.creado_en >= $${params.length}`);
    }
    if (fechaHasta) {
      params.push(fechaHasta);
      conditions.push(`pe.creado_en <= $${params.length}`);
    }
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }
    query += `
      GROUP BY p.id, p.nombre, p.precio
      HAVING COALESCE(SUM(pi.cantidad), 0) > 0
      ORDER BY unidades_vendidas DESC, monto_recaudado DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limit);
    const { rows } = await pool.query(query, params);
    return rows;
  }

  async getIngresosPorPeriodo(fechaDesde, fechaHasta) {
    const { rows } = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS cantidad_pedidos
       FROM pedido
       WHERE estado != 'cancelado'
         AND creado_en >= $1 AND creado_en <= $2`,
      [fechaDesde, fechaHasta]
    );
    return rows[0];
  }

  async getIngresosDiarios(fechaDesde, fechaHasta) {
    const { rows } = await pool.query(
      `SELECT
         DATE(creado_en) AS fecha,
         COALESCE(SUM(total), 0) AS total,
         COUNT(*) AS cantidad_pedidos
       FROM pedido
       WHERE estado != 'cancelado'
         AND creado_en >= $1 AND creado_en <= $2
       GROUP BY DATE(creado_en)
       ORDER BY fecha ASC`,
      [fechaDesde, fechaHasta]
    );
    return rows;
  }

  async getDistribucionEstados() {
    const { rows } = await pool.query(
      `SELECT estado, COUNT(*) AS cantidad
       FROM pedido
       GROUP BY estado
       ORDER BY cantidad DESC`
    );
    const total = rows.reduce((acc, r) => acc + parseInt(r.cantidad, 10), 0);
    return rows.map((r) => ({
      estado: r.estado,
      cantidad: parseInt(r.cantidad, 10),
      porcentaje: total > 0 ? ((parseInt(r.cantidad, 10) / total) * 100).toFixed(1) : "0.0",
    }));
  }

  async getTicketPromedio(fechaDesde = null, fechaHasta = null) {
    let query = `
      SELECT
        COALESCE(AVG(total), 0) AS ticket_promedio_pedido,
        COUNT(*) AS total_pedidos
      FROM pedido
      WHERE estado != 'cancelado'
    `;
    const params = [];
    if (fechaDesde) {
      params.push(fechaDesde);
      query += ` AND creado_en >= $${params.length}`;
    }
    if (fechaHasta) {
      params.push(fechaHasta);
      query += ` AND creado_en <= $${params.length}`;
    }
    const { rows } = await pool.query(query, params);

    let queryUser = `
      SELECT COALESCE(AVG(gasto), 0) AS ticket_promedio_usuario
      FROM (
        SELECT cliente_id, SUM(total) AS gasto
        FROM pedido
        WHERE estado != 'cancelado'
    `;
    if (fechaDesde) {
      queryUser += ` AND creado_en >= $1`;
    }
    if (fechaHasta) {
      queryUser += ` AND creado_en <= $${params.length}`;
    }
    queryUser += ` GROUP BY cliente_id
      ) sub`;
    const { rows: rowsUser } = await pool.query(queryUser, params);

    return {
      ticket_promedio_pedido: parseFloat(rows[0].ticket_promedio_pedido),
      total_pedidos: parseInt(rows[0].total_pedidos, 10),
      ticket_promedio_usuario: parseFloat(rowsUser[0].ticket_promedio_usuario),
    };
  }

  async getResumenGeneral(fechaDesde = null, fechaHasta = null) {
    let whereClause = "WHERE estado != 'cancelado'";
    const params = [];
    if (fechaDesde) {
      params.push(fechaDesde);
      whereClause += ` AND creado_en >= $${params.length}`;
    }
    if (fechaHasta) {
      params.push(fechaHasta);
      whereClause += ` AND creado_en <= $${params.length}`;
    }
    const { rows } = await pool.query(
      `SELECT
         COALESCE(SUM(total), 0) AS ingresos_totales,
         COUNT(*) AS total_pedidos,
         COALESCE(AVG(total), 0) AS ticket_promedio
       FROM pedido
       ${whereClause}`,
      params
    );
    return rows[0];
  }
}

module.exports = PostgresAnalyticsRepository;
