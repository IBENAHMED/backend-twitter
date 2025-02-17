import express from "express"
import {authentification} from "../middleware/authentification.js"
import {deleteNotifications, getAllNotification} from "../controllers/notification.controller.js"

const router = express.Router()

router.get("/getAllNotification", authentification, getAllNotification)
router.delete("/deleteNotifications", authentification, deleteNotifications)

export default router
