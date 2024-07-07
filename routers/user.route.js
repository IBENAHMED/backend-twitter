import express from "express";
import { getUserProfile, followUnfollowUser, suggested, updateUser } from "../controllers/user.controller.js";
import { authentification } from "../middleware/authentification.js";

let router = express.Router();

router.get('/getUserProfile/:username', authentification, getUserProfile);
router.post('/followUnfollowUser/:id', authentification, followUnfollowUser);
router.get('/suggested', authentification, suggested);
router.post('/updateUser', authentification, updateUser);

export default router;