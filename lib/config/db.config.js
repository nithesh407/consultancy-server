import dotenv from "dotenv";

dotenv.config({ path: '.env' })
const PRODUCT_TABLE_NAME = process.env.PRODUCT_TABLE_NAME
const USER_TABLE_NAME = process.env.USER_TABLE_NAME
const productTableConfig = {
    aws_remote_config: {
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
};

const userTableConfig = {
    aws_remote_config: {
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
};

export { productTableConfig, userTableConfig, PRODUCT_TABLE_NAME, USER_TABLE_NAME }