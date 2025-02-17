dotenv.config()
import express from "express"
import dotenv from "dotenv"
import {authRoutes, userRoutes, postRoutes, notificationRoutes} from "./routers/index.js"
import {connectMongodb} from "./db/conectMongodb.js"
import cors from "cors"
import {v2 as cloudinary} from "cloudinary"
import mongoose from "mongoose"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json({limit: "5mb"}))
app.use(cors())

mongoose
  .connect(`${process.env.MONGO_URI}`)
  .then(() => {
    console.log("Database connected")
  })
  .catch((err) => {
    console.error("Database connection error:", err)
  })

app.use(express.urlencoded({extended: true}))

app.use("/", authRoutes)
app.use("/", userRoutes)
app.use("/", postRoutes)
app.use("/", notificationRoutes)

app.listen(PORT, (err) => {
  if (err) {
    console.error(`Error: ${err}`)
  } else {
    console.log(`Server running on port ${PORT}`)
    connectMongodb()
  }
})
