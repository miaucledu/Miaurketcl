class User {
  constructor(id, nombre, email, password_hash) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.password_hash = password_hash;
  }
}

module.exports = User;