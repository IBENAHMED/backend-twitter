import mongoose from "mongoose"

export let connectMongodb = () => {
  mongoose
    .connect(`${process.env.MONGO_URI}`)
    .then(() => {
      console.log("Database connected")
    })
    .catch((err) => {
      console.error("Database connection error:", err)
      process.exit(1)
    })
}
