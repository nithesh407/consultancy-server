import express from "express"

import { getUsers } from "../controllers/userController.js";

const router = express.Router();

router
    .route('/')
    .get(getUsers)
// .post()


export default router;