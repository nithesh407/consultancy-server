import express from "express"

// import { getProducts, addProducts, getProductById, updateProduct, removeProduct } from "../controllers/productController.js";
import {
    getProducts,
    getProductById,
    addProducts,
    updateProduct,
    deleteProduct
} from "../controllers/productController.js";

const router = express.Router();

router
    .route('/')
    .get(getProducts)
    .post(addProducts)

router
    .route('/:productID')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct)

export default router;