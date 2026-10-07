class Producto {
  constructor(id, nombre, descripcion, precio, imagen_filename, vendedor_id, estado, creado_en) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.imagen_filename = imagen_filename;
    this.vendedor_id = vendedor_id;
    this.estado = estado;
    this.creado_en = creado_en;
  }

  static fromRow(row) {
    return new Producto(
      row.id,
      row.nombre,
      row.descripcion,
      row.precio,
      row.imagen_filename ?? null,
      row.vendedor_id,
      row.estado,
      row.creado_en
    );
  }

  esPendiente() {
    return this.estado === "pendiente";
  }

  esAprobado() {
    return this.estado === "aprobado";
  }

  esRechazado() {
    return this.estado === "rechazado";
  }
}

module.exports = Producto;
