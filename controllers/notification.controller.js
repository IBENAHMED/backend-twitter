import Notification from "../models/notification.model.js"

export const getAllNotification = async (req, res) => {
  try {
    let userId = req.user._id
    let notification = await Notification.find({to: userId}).populate({path: "from", select: "-password"})
    if (!notification) {
      res.json({
        error: "there isn't any notification",
      })
    }

    res.json({
      notification,
    })
  } catch (error) {
    res.json({
      error: "Invalid Server Error",
    })
  }
}

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id
    await Notification.deleteMany({to: userId})
    let notification = await Notification.findOne({to: userId})
    res.status(200).json(notification)
  } catch (error) {
    res.status(500).json({error: "Internal Server Error"})
  }
}
