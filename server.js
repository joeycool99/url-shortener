require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const { body, validationResult } = require("express-validator")
const rateLimit = require("express-rate-limit")
const ShortUrl = require("./models/shortUrl")
const User = require("./models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const bodyParser = require("body-parser")
const app = express()
var cors = require("cors")
const { isValidURL,generateShortURL } = require("./utils")

app.use(cors())
app.use(express.urlencoded({ extended: false }))

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
})

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))


app.use(bodyParser.json())

app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ ...req.body, password: hashedPassword })
    await newUser.save()
    return res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" })
    }
    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "1h",
    })
    res.status(200).json({ token })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

app.get("/api", async (req, res) => {
  const shortUrls = await ShortUrl.find()
  res.send({ shortUrls: shortUrls })
})

app.post("/api/shortUrls",apiLimiter,[body("fullUrl").isURL().withMessage("Invalid URL")],async (req, res) => {
    const token = req.headers.authorization
    if (!token) {
      return res.status(401).json({ message: "Authentication failed" })
    }
    jwt.verify(token, "your-secret-key", async (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Authentication failed" })
      }})

    const errors = validationResult(req)
    const expirationDays = 7
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + expirationDays)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.msg })
    }

    const { fullUrl } = req.body
    if (!isValidURL(fullUrl)) {
      return res.status(400).json({ error: "Invalid URL" })
    }

    try {
      await ShortUrl.create({
        full: fullUrl,
        short:generateShortURL(),
        expirationDate: expirationDate,
      })
      res.send("done")
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Server Error" })
    }
  }
)

app.get("/api/:shortUrl", apiLimiter, async (req, res) => {
  const { shortUrl } = req.params
  try {
    const shortUrlDoc = await ShortUrl.findOne({ short: shortUrl })
    if (!shortUrlDoc) {
      return res.sendStatus(404)
    }
    const currentDate = new Date();
    if (shortUrlDoc.expirationDate && currentDate > shortUrlDoc.expirationDate) {
      return res.status(410).json({ error: "URL has expired" }); 
    }
    shortUrlDoc.clicks++
    await shortUrlDoc.save()
    res.redirect(shortUrlDoc.full)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server Error" })
  }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

module.exports = app
