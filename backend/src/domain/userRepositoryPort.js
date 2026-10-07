class UserRepositoryPort {
  async findAll() {
    throw new Error("Not implemented");
  }

  async findByEmail(email) {
    throw new Error("Not implemented");
  }

  async findById(id) {
    throw new Error("Not implemented");
  }

  async findByRol(rol) {
    throw new Error("Not implemented");
  }

  async create(user) {
    throw new Error("Not implemented");
  }

  async update(id, user) {
    throw new Error("Not implemented");
  }

  async delete(id) {
    throw new Error("Not implemented");
  }

  async updateRol(id, rol) {
    throw new Error("Not implemented");
  }

  async updateEstadoAcceso(id, estado_acceso) {
    throw new Error("Not implemented");
  }
}

module.exports = UserRepositoryPort;

