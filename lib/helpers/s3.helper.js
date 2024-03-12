import s3Client from "../config/s3.config.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

async function uploadFileToS3(file, fileName, folder) {
    const fileBuffer = file

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${folder}/${fileName}-${Date.now()}`,
        Body: fileBuffer,
        ContentType: "image/jpg"
    }

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${params.Key}`;
    return url
}

export default uploadFileToS3