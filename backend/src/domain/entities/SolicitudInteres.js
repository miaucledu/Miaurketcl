class SolicitudInteres {
  constructor(id, usuario_id, producto_id, estado, creado_en) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.producto_id = producto_id;
    this.estado = estado;
    this.creado_en = creado_en;
  }

  static fromRow(row) {
    return new SolicitudInteres(
      row.id,
      row.usuario_id,
      row.producto_id,
      row.estado,
      row.creado_en
    );
  }
}

module.exports = SolicitudInteres;
