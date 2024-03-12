import express from "express"

import { getProducts, addProducts } from "../controllers/productController.js";

const router = express.Router();

router
    .route('/')
    .get(getProducts)
    .post(addProducts)


export default router;