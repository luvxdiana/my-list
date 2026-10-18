
const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.cookies?.mylist_session;

  if (!token) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    if (
      typeof decoded.sub !== "string" ||
      !/^\d+$/.test(decoded.sub)
    ) {
      return res.status(401).json({
        message: "Invalid session"
      });
    }

    req.userId = decoded.sub;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired session"
    });
  }
}

module.exports = requireAuth;
