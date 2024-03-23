import multer from "multer"

const upload = multer();

import uploadFileToS3 from "../lib/helpers/s3.helper.js"
import { v4 as uuidv4 } from "uuid";
import { productClient } from "../lib/helpers/Dynamo/product.helper.js";
import { PRODUCT_TABLE_NAME } from "../lib/config/db.config.js";
import sharp from "sharp";
import {
    GetItemCommand,
    DeleteItemCommand,
    PutItemCommand,
    UpdateItemCommand,
    ScanCommand
} from "@aws-sdk/client-dynamodb"


export const addProducts = async (req, res, next) => {
    try {
        upload.single('file')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status: "fail",
                    message: "Error uploading file"
                });
            }
            const formData = req.body;
            const file = req.file;
            if (!file) {
                return res.status(404).json({
                    status: "fail",
                    message: "No File found"
                });
            }
            const buffer = Buffer.from(file.buffer);
            const resizedBuffer = await sharp(buffer)
                .resize({ height: 240, width: 269 })
                .toBuffer()
            const { productDescription, productDiscountPrice, productOriginalPrice, productRating } = formData;
            const productImageUrl = await uploadFileToS3(resizedBuffer, file.originalname, 'products');
            const command = new PutItemCommand({
                TableName: PRODUCT_TABLE_NAME,
                Item: {
                    productID: { S: uuidv4() },
                    productImageUrl: { S: productImageUrl },
                    productDescription: { S: productDescription },
                    productDiscountPrice: { S: productDiscountPrice },
                    productOriginalPrice: { S: productOriginalPrice },
                    productRating: { S: productRating }
                }
            })

            const response = await productClient.send(command)
            console.log(response)
            return res.status(201).json({
                status: "success",
                message: 'Product Created',
            });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "fail",
            message: "Cannot create Product"
        });
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const { productID } = req.params;
        const command = new GetItemCommand({
            TableName: PRODUCT_TABLE_NAME,
            Key: {
                productID: { S: productID }
            }
        });
        const {
            Item: {
                productDescription:
                {
                    S: productDescription
                },
                productImageUrl:
                {
                    S: productImageUrl
                },
                productDiscountPrice:
                {
                    S: productDiscountPrice
                },
                productOriginalPrice:
                {
                    S: productOriginalPrice
                }
            }
        } = await productClient.send(command)
        return res.status(200).json({
            status: "success",
            data: {
                productImageUrl,
                productDescription,
                productDiscountPrice,
                productOriginalPrice
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "fail",
            message: "Cannot get Product"
        });
    }
}
export const updateProduct = async (req, res, next) => {
    try {
        const { productID } = req.params;
        console.log(productID);
        const { productOriginalPrice, productDiscountPrice, productDescription, productRating } = req.body;
        console.log(productDescription, productOriginalPrice, productDiscountPrice);
        const data = {
            productDescription: { S: productDescription },
            productDiscountPrice: { S: productDiscountPrice },
            productOriginalPrice: { S: productOriginalPrice },
            productRating: { S: productRating }
        }
        const command = new UpdateItemCommand({
            TableName: PRODUCT_TABLE_NAME,
            Key: {
                productID: { S: productID },
            },
            UpdateExpression: "SET productDescription = :productDescription, productOriginalPrice = :productOriginalPrice, productDiscountPrice = :productDiscountPrice, productRating = :productRating",
            ExpressionAttributeValues: {
                ":productDescription": data.productDescription,
                ":productOriginalPrice": data.productOriginalPrice,
                ":productDiscountPrice": data.productDiscountPrice,
                ":productRating": data.productRating
            },
            ReturnValues: "ALL_NEW"
        });
        const response = await productClient.send(command)
        console.log(response)
        return res.status(201).json({
            status: "success",
            message: 'Product Updated',
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "fail",
            message: "Cannot update product"
        });
    }
}
export const deleteProduct = async (req, res, next) => {
    try {
        const { productID } = req.params;
        console.log(productID);
        const command = new DeleteItemCommand({
            TableName: PRODUCT_TABLE_NAME,
            Key: {
                productID: { S: productID },
            }
        });
        const response = await productClient.send(command)
        console.log(response)
        return res.status(200).json({
            status: "success",
            message: 'Product Deleted Successfully',
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "fail",
            message: "Cannot delete product"
        });
    }
}
export const getProducts = async (req, res, next) => {
    try {
        const command = new ScanCommand({
            TableName: PRODUCT_TABLE_NAME,
        });
        const { Items, Count: totalProducts } = await productClient.send(command);

        //Removinf S in the Items
        const data = Items.map(item => {
            Object.keys(item).forEach(key => {
                item[key] = item[key]["S"];
            });
            return item;
        });
        return res.status(200).json({
            status: "success",
            totalProducts,
            data
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "fail",
            message: "Cannot get Products"
        });
    }
}


