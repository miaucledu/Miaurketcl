class Usuario {
  constructor(id, nombre, email, password_hash, rol, estado_acceso, creado_en) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.password_hash = password_hash;
    this.rol = rol;
    this.estado_acceso = estado_acceso;
    this.creado_en = creado_en;
  }

  static fromRow(row) {
    return new Usuario(
      row.id,
      row.nombre,
      row.email,
      row.password_hash,
      row.rol ?? null,
      row.estado_acceso,
      row.creado_en
    );
  }

  tieneRol(...roles) {
    return roles.includes(this.rol);
  }

  estaAprobado() {
    return this.estado_acceso === "aprobado";
  }

  estaPendiente() {
    return this.estado_acceso === "pendiente";
  }
}

module.exports = Usuario;
