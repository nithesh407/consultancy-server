import mongoose from "mongoose";
import dotenv from "dotenv";

import app from "./app.js";

dotenv.config({ path: '.env' })
const port = process.env.APPLICATION_PORT || 5000
app.listen(port, () => {
    console.log(`Server Listening at ${port}`)
})
