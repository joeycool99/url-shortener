const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body
    console.log(email, password)
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" })
    }

    const saltRounds = 10; 
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt)
    const newUser = new User({ ...req.body, password: hashedPassword })
    await newUser.save()
    return res.status(201).json({ message: "User registered successfully" })

  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

exports.login = async (req, res) => {
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

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    })
    res.status(200).json({ token })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}
