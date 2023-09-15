const validUrl = require("valid-url")

function generateShortURL() {
  const characters ="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
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

module.exports = { generateShortURL, isValidURL }
