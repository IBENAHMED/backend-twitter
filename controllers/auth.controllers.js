import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

export const sigup = async (req, res) => {
  try {
    let {username, fullName, password, email} = req.body
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      })
    }

    let existingUserName = await User.findOne({username})
    if (existingUserName) {
      return res.status(400).json({
        error: "this username already exists",
      })
    }

    let existingUserEmail = await User.findOne({email})
    if (existingUserEmail) {
      return res.status(400).json({
        error: "this email already exists",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "the password must be at the least 6 characters",
      })
    }

    let salt = await bcrypt.genSalt(10)
    let passwordHash = await bcrypt.hash(password, salt)

    let newUser = new User({
      username,
      fullName,
      email,
      password: passwordHash,
    })

    await newUser.save()

    if (newUser) {
      const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET)
      return res.status(201).json({token})
    } else {
      return res.status(400).json({
        message: "Invalid user data",
      })
    }
  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error",
    })
  }
}

export const login = async (req, res) => {
  const {email, password} = req.body
  if (email && password) {
    try {
      const user = await User.findOne({email})
      if (!user) {
        return res.status(400).json({error: "Invalid login"})
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        return res.status(400).json({error: "Invalid login"})
      }

      const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
      return res.status(200).json({token})
    } catch (err) {
      console.error(err)
      res.status(500).json({error: "Failed to login user"})
    }
  } else {
    res.status(400).json({error: "Missing required fields"})
  }
}

export const getMe = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select("-password")
    res.status(200).json({user})
  } catch (error) {
    res.status(500).json({
      error: "Invalid Server Error",
    })
  }
}
