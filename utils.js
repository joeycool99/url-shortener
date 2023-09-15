const validUrl = require("valid-url")
const multer = require("multer")
const rateLimit = require("express-rate-limit")

function generateShortURL() {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const base = characters.length
  const keyLength = 6
  let shortURL = ""
  for (let i = 0; i < keyLength; i++) {
    const randomIndex = Math.floor(Math.random() * base)
    shortURL += characters[randomIndex]
  }
  return shortURL
}

function isValidURL(url) {
  return validUrl.isUri(url)
}

const logStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const logDir = path.join(__dirname, "logs")
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir)
    }
    cb(null, logDir)
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now()
    cb(null, `log_${timestamp}.txt`)
  },
})

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
})

module.exports = { generateShortURL, isValidURL, logStorage, apiLimiter }
