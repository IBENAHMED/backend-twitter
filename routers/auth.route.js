import express from "express";
import { login, sigup, getMe } from "../controllers/auth.controllers.js";
import { authentification } from "../middleware/authentification.js";

let router = express.Router();

router.get('/me', authentification, getMe);
router.post('/sigup', sigup);
router.post('/login', login);
// router.post('/logout', authentification, logout);

export default router;
// module.exports = router;