import express from "express"
import {authentification} from "../middleware/authentification.js"
import {commentOnPost, createPost, deletePost, getAllPosts, likeUnlikePost, getLikedPosts, getFollowingPosts, getUserPosts} from "../controllers/post.controller.js"

const router = express.Router()

router.get("/all", authentification, getAllPosts)
router.get("/following", authentification, getFollowingPosts)
router.get("/likes/:id", authentification, getLikedPosts)
router.get("/user/:username", authentification, getUserPosts)
router.post("/create", authentification, createPost)
router.post("/like/:id", authentification, likeUnlikePost)
router.post("/comment/:id", authentification, commentOnPost)
router.delete("/delete/:id", authentification, deletePost)

export default router
