import express from "express";

import userRouter from "./routes/userRoutes.js"
import productRouter from "./routes/productRoutes.js"
import cors from "cors"
import dotenv from "dotenv";
import morgan from "morgan";
dotenv.config({ path: '.env' })
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    next();
})
app.use('/api/v1/users', userRouter)
app.use('/api/v1/products', productRouter)

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    return res.status(statusCode).json({
        status: false,
        statusCode,
        message,
    });
});

export default app;