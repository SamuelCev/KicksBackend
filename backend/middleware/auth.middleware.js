const jwt = require("jsonwebtoken");

exports.loginRequired = (req, res, next) => {

  // Extraer el token de la cookie httpOnly llamada 'token'
  const token = req.cookies && req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "No autorizado. Falta el token." });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "ioufrwenfcierowcnoewnrcuiewqoty4370829147"
    );

    // Tu token contiene: { userId, email, rol }
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRol = decoded.rol;

    next();

  } catch (err) {
    return res.status(401).json({ error: "Token no válido o expirado." });
  }
};
