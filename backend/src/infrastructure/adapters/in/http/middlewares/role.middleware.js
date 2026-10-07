module.exports = function roleMiddleware(allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ msg: "No autenticado" });
    }
    if (req.user.estado_acceso !== "aprobado") {
      return res.status(403).json({ msg: "Acceso denegado: cuenta no aprobada" });
    }
    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ msg: "Rol no autorizado" });
    }
    next();
  };
};
