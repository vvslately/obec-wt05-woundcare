const { verifyToken } = require("../lib/jwt");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "unauthorized", message: "Missing bearer token" });
  }

  try {
    const payload = verifyToken(token);
    req.auth = {
      userId: Number(payload.sub),
      email: payload.email,
      role: payload.role
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "unauthorized", message: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };
