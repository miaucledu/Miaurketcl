class PasswordPolicy {
  static validate(password) {
    if (!password || password.length < 6) {
      const error = new Error("La contraseña debe tener al menos 6 caracteres");
      error.status = 400;
      throw error;
    }
    return true;
  }
}

module.exports = PasswordPolicy;
