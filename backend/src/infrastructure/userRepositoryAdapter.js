const UserRepositoryPort = require("../domain/userRepositoryPort");
const pool = require("./db");
const Usuario = require("../domain/entities/Usuario");

class UserRepositoryAdapter extends UserRepositoryPort {
  async findAll() {
    const { rows } = await pool.query(
      "SELECT id, nombre, email, password_hash, rol, estado_acceso, creado_en FROM usuario"
    );
    return rows.map((r) => Usuario.fromRow(r));
  }

  async findByEmail(email) {
    const { rows } = await pool.query(
      "SELECT id, nombre, email, password_hash, rol, estado_acceso, creado_en FROM usuario WHERE email = $1",
      [email]
    );
    if (rows.length === 0) return null;
    return Usuario.fromRow(rows[0]);
  }

  async findById(id) {
    const { rows } = await pool.query(
      "SELECT id, nombre, email, password_hash, rol, estado_acceso, creado_en FROM usuario WHERE id = $1",
      [id]
    );
    if (rows.length === 0) return null;
    return Usuario.fromRow(rows[0]);
  }

  async findByRol(rol) {
    const { rows } = await pool.query(
      "SELECT id, nombre, email, password_hash, rol, estado_acceso, creado_en FROM usuario WHERE rol = $1",
      [rol]
    );
    return rows.map((r) => Usuario.fromRow(r));
  }

  async create(user) {
    const result = await pool.query(
      `INSERT INTO usuario (nombre, email, password_hash, rol, estado_acceso)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [user.nombre, user.email, user.password_hash, user.rol, user.estado_acceso]
    );
    return result.rows[0].id;
  }

  async update(id, user) {
    await pool.query(
      `UPDATE usuario SET nombre = $1, email = $2, password_hash = $3 WHERE id = $4`,
      [user.nombre, user.email, user.password_hash, id]
    );
    return id;
  }

  async updateRol(id, rol) {
    await pool.query("UPDATE usuario SET rol = $1 WHERE id = $2", [rol, id]);
  }

  async updateEstadoAcceso(id, estado_acceso) {
    await pool.query("UPDATE usuario SET estado_acceso = $1 WHERE id = $2", [estado_acceso, id]);
  }

  async delete(id) {
    await pool.query("DELETE FROM usuario WHERE id = $1", [id]);
    return id;
  }
}

module.exports = UserRepositoryAdapter;
