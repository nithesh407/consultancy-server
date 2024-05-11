import express from "express"

import { sendOTP, verifyAdminLogin, verifyOTP } from "../controllers/userController.js";

const router = express.Router();

router
    .route('/verify/admin')
    .post(verifyAdminLogin)
router
    .route('/forgot')
    .get(sendOTP)
    .post(verifyOTP)

export default router;