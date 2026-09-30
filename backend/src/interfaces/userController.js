const crypto = require("crypto");

class UserController {
  constructor(userService, captchaStore) {
    this.userService = userService;
    this.captchaStore = captchaStore;
  }

  async getAll(req, res) {
    try {
      const users = await this.userService.getAll();
      res.json(users.map((u) => this.sanitize(u)));
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async getById(req, res) {
    try {
      const user = await this.userService.getById(req.params.id);
      res.json(this.sanitize(user));
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async register(req, res) {
    const { nombre, email, password, captchaId, respuesta } = req.body;
    const valid = this.captchaStore.validate(captchaId, respuesta);
    if (!valid) {
      return res.status(400).json({ msg: "Captcha inválido" });
    }
    try {
      const userId = await this.userService.register(nombre, email, password);
      res.status(201).json({ msg: "Usuario registrado", id: userId });
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async login(req, res) {
    const { email, password, captchaId, respuesta } = req.body;
    const valid = this.captchaStore.validate(captchaId, respuesta);
    if (!valid) {
      return res.status(400).json({ msg: "Captcha inválido" });
    }
    try {
      const result = await this.userService.login(email, password);
      res.json(result);
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async updateRol(req, res) {
    try {
      await this.userService.updateRol(req.params.id, req.body.rol);
      res.json({ msg: "Rol actualizado" });
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async updateEstadoAcceso(req, res) {
    try {
      await this.userService.updateEstadoAcceso(req.params.id, req.body.estado_acceso);
      res.json({ msg: "Estado de acceso actualizado" });
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  async delete(req, res) {
    try {
      await this.userService.delete(req.params.id);
      res.json({ msg: "Usuario eliminado" });
    } catch (e) {
      res.status(e.status || 500).json({ msg: e.message });
    }
  }

  sanitize(user) {
    const { password_hash, ...rest } = user;
    return rest;
  }
}

module.exports = UserController;
