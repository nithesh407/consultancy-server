import mongoose from "mongoose";
import dotenv from "dotenv";

import app from "./app.js";

dotenv.config({ path: '.env' })

app.listen(process.env.APPLICATION_PORT, () => {
    console.log(`Server Listening at ${process.env.APPLICATION_PORT}`)
})
