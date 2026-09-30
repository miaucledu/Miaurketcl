class ProductoController {
  constructor(productoService) {
    this.productoService = productoService;
  }

  async crear(req, res) {
    const { nombre, descripcion, precio } = req.body;
    const imagen_filename = req.file ? req.file.filename : null;
    try {
      const id = await this.productoService.create(
        req.user.id, nombre, descripcion, precio, imagen_filename
      );
      res.status(201).json({ msg: "Producto creado", id });
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async listarMios(req, res) {
    try {
      const productos = await this.productoService.listarMios(req.user.id);
      res.json(productos);
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async listarPendientes(req, res) {
    try {
      const productos = await this.productoService.listarPendientes();
      res.json(productos);
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async listarAprobados(req, res) {
    try {
      const productos = await this.productoService.listarAprobados();
      res.json(productos);
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async getById(req, res) {
    try {
      const producto = await this.productoService.getById(req.params.id);
      res.json(producto);
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async actualizar(req, res) {
    const { nombre, descripcion, precio } = req.body;
    const imagen_filename = req.file ? req.file.filename : undefined;
    try {
      await this.productoService.update(
        req.params.id, req.user.id, nombre, descripcion, precio, imagen_filename
      );
      res.json({ msg: "Producto actualizado" });
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async aprobar(req, res) {
    const { estado } = req.body;
    try {
      await this.productoService.aprobar(req.params.id, estado);
      res.json({ msg: "Producto actualizado" });
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async eliminar(req, res) {
    try {
      await this.productoService.delete(req.params.id, req.user.id);
      res.json({ msg: "Producto eliminado" });
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }
}

module.exports = ProductoController;
