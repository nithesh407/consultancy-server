import dotenv from "dotenv";
dotenv.config({ path: '.env' })

import { S3Client } from "@aws-sdk/client-s3";

const s3ClientConfig = {
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    }
};
const s3Client = new S3Client(s3ClientConfig);

export default s3Client