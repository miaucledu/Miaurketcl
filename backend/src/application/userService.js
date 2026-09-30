const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../domain/entities/Usuario");
const UserRepositoryPort = require("../domain/userRepositoryPort");
const PasswordPolicy = require("../domain/services/PasswordPolicy");

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register(nombre, email, password) {
    PasswordPolicy.validate(password);
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      const error = new Error("El correo ya existe");
      error.status = 409;
      throw error;
    }
    const password_hash = await bcrypt.hash(password, 10);
    const userId = await this.userRepository.create(
      new Usuario(null, nombre, email, password_hash, null, "pendiente")
    );
    return userId;
  }

  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      const error = new Error("Credenciales incorrectas");
      error.status = 401;
      throw error;
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      const error = new Error("Credenciales incorrectas");
      error.status = 401;
      throw error;
    }
    const token = jwt.sign(
      { id: user.id, rol: user.rol, estado_acceso: user.estado_acceso },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    return { token, usuario: Usuario.fromRow({ ...user, password_hash: undefined }) };
  }

  async getAll() {
    return await this.userRepository.findAll();
  }

  async getById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      const error = new Error("Usuario no encontrado");
      error.status = 404;
      throw error;
    }
    return user;
  }

  async updateRol(id, rol) {
    const allowedRoles = ["admin", "producto", "pedido"];
    if (!allowedRoles.includes(rol)) {
      const error = new Error("Rol inválido");
      error.status = 400;
      throw error;
    }
    await this.userRepository.updateRol(id, rol);
  }

  async updateEstadoAcceso(id, estado_acceso) {
    const allowed = ["pendiente", "aprobado", "denegado"];
    if (!allowed.includes(estado_acceso)) {
      const error = new Error("Estado de acceso inválido");
      error.status = 400;
      throw error;
    }
    await this.userRepository.updateEstadoAcceso(id, estado_acceso);
  }

  async delete(id) {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      const error = new Error("Usuario no encontrado");
      error.status = 404;
      throw error;
    }
    return await this.userRepository.delete(id);
  }
}

module.exports = UserService;
