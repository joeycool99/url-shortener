const jwt = require("jsonwebtoken")

exports.authCheck = async (req, res, next) => {
  try {
    const token = req.headers.authorization
    if (!token) {
      return res.status(401).json({ message: "Authentication failed" })
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Authentication failed" })
      }
    })
    next()
  } catch (err) {
    res.status(401).json({
      err: "invalid token",
    })
  }
}
