import mongoose from "mongoose"

let NotificationShema = mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    type: {
      type: String,
      require: true,
      enum: ["like", "follow"],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {timestamps: true},
)

let Notification = mongoose.model("Notification", NotificationShema)
export default Notification
