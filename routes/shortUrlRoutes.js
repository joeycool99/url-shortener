const express = require("express")
const router = express.Router()
const {  apiLimiter } = require("../utils")

const { authCheck } = require("../middlewares/auth")

const {
  createShortUrl,
  getShortUrls,
  getShortUrlById,
} = require("../controllers/shortUrlRoutes.js")

router.post("/shortUrls", authCheck, apiLimiter,createShortUrl)
router.get("/:shortUrl", getShortUrlById)
router.get("/", authCheck, apiLimiter,getShortUrls)

module.exports = router
