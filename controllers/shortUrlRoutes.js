const { isValidURL, generateShortURL } = require("../utils")
const ShortUrl = require("../models/shortUrl")

exports.getShortUrls = async (req, res) => {
  const shortUrls = await ShortUrl.find()
  res.send({ shortUrls: shortUrls })
}

exports.createShortUrl = async (req, res) => {
  const expirationDays = 7
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + expirationDays)

  const { fullUrl } = req.body
  if (!isValidURL(fullUrl)) {
    return res.status(400).json({ error: "Invalid URL" })
  }

  try {
    await ShortUrl.create({
      full: fullUrl,
      short: generateShortURL(),
      expirationDate: expirationDate,
    })
    res.send("done")
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server Error" })
  }
}

exports.getShortUrlById = async (req, res) => {
  const { shortUrl } = req.params
  
  try {
    const shortUrlDoc = await ShortUrl.findOne({ short: shortUrl })
    if (!shortUrlDoc) {
      return res.sendStatus(404)
    }

    const currentDate = new Date()
    if (
      shortUrlDoc.expirationDate &&
      currentDate > shortUrlDoc.expirationDate
    ) {
      return res.status(410).json({ error: "URL has expired" })
    }

    shortUrlDoc.clicks++
    await shortUrlDoc.save()
    res.redirect(shortUrlDoc.full)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server Error" })
  }
}
