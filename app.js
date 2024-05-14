import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoutes.js"
import productRouter from "./routes/productRoutes.js"
import cors from "cors"
import dotenv from "dotenv";
import morgan from "morgan";
dotenv.config({ path: '.env' })
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
const allowedDomains = ['https://srivinayaga-admin.vercel.app', 'https://srivinayaga.vercel.app'];

app.use(cors({
    origin: function (origin, callback) {
        // Check if the request origin is allowed
        if (!origin || allowedDomains.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(morgan('dev'))
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', allowedDomains.join(','));
//     next();
// });
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