import mongoose from "mongoose";
import dotenv from "dotenv";

import app from "./app.js";

dotenv.config({ path: '.env' })

const DB = process.env.DB_URL.replace('<password>', process.env.DB_PASSWORD)

mongoose.connect(DB)
    .then(() => {
        console.log("DB Connected")
    })
    .catch((err) => {
        console.log(`DB NOT CONNECTED : ${err}`)
    })

app.listen(process.env.APPLICATION_PORT, () => {
    console.log(`Server Listening at ${process.env.APPLICATION_PORT}`)
})
