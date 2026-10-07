class InMemoryCaptchaService {
  constructor() {
    this.store = new Map();
  }

  generate() {
    const captchaId = crypto.randomUUID();
    const codigo = this._generarCodigo(6);
    this.store.set(captchaId, { codigo, expira: Date.now() + 120000 });
    return { captchaId, codigo, imagenes: this._generarImagenes(codigo) };
  }

  validate(captchaId, respuesta) {
    const entry = this.store.get(captchaId);
    if (!entry) return false;
    if (Date.now() > entry.expira) {
      this.store.delete(captchaId);
      return false;
    }
    this.store.delete(captchaId);
    return entry.codigo === respuesta.toUpperCase();
  }

  _generarCodigo(longitud) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < longitud; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  _generarImagenes(codigo) {
    return codigo.split("").map((car) => this._crearImg(car));
  }

  _crearImg(caracter) {
    const angulo = Math.random() * 30 - 15;
    const x = Math.random() * 20;
    const y = Math.random() * 10;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='40' viewBox='0 0 60 40'><rect width='60' height='40' fill='#f0f0f0'/><text x='${30 + x}' y='${25 + y}' font-size='24' font-weight='bold' transform='rotate(${angulo} 30 20)' fill='#333' text-anchor='middle'>${caracter}</text></svg>`;
    return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
  }
}

const crypto = require("crypto");
module.exports = { InMemoryCaptchaService };
