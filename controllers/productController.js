import multer from "multer"

const upload = multer();
import { removeBackground } from "@imgly/background-removal-node"
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
        function toArrayBuffer(buffer) {
            return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        }
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
            const resizedImg = await sharp(buffer)
                .resize({
                    width: 368,
                    height: 480,
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 1 }
                })
                .toBuffer();


            const { productDescription, productDiscountPrice, productOriginalPrice, productRating, path, ratings, title, brand, category } = formData;
            console.log(productDescription, productDiscountPrice, productOriginalPrice, productRating, path, ratings, title, brand, category)
            const productImageUrl = await uploadFileToS3(resizedImg, file.originalname, 'products');
            console.log(productImageUrl);
            const command = new PutItemCommand({
                TableName: PRODUCT_TABLE_NAME,
                Item: {
                    productID: { S: (Math.floor(Math.random() * 451) + 51).toString() },
                    productImageUrl: { L: [{ S: productImageUrl }] }, productDescription: { S: productDescription },
                    productDiscountPrice: { N: productDiscountPrice },
                    productOriginalPrice: { N: productOriginalPrice },
                    productRating: { N: productRating },
                    path: { S: path },
                    category: { S: category },
                    brand: { S: brand },
                    title: { S: title },
                    ratings: { N: ratings },
                }
            })

            const response = await productClient.send(command)
            console.log(response)
            return res.status(201).json({
                status: "success",
                message: 'Product Created',
                productImageUrl
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

// export const getProductById = async (req, res, next) => {
//     try {
//         const { productID } = req.params;
//         const command = new GetItemCommand({
//             TableName: PRODUCT_TABLE_NAME,
//             Key: {
//                 productID: { S: productID }
//             }
//         });
//         const {
//             Item: {
//                 productDescription:
//                 {
//                     S: productDescription
//                 },
//                 productImageUrl:
//                 {
//                     S: productImageUrl
//                 },
//                 productDiscountPrice:
//                 {
//                     S: productDiscountPrice
//                 },
//                 productOriginalPrice:
//                 {
//                     S: productOriginalPrice
//                 }
//             }
//         } = await productClient.send(command)
//         return res.status(200).json({
//             status: "success",
//             data: {
//                 productImageUrl,
//                 productDescription,
//                 productDiscountPrice,
//                 productOriginalPrice
//             }
//         });
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({
//             status: "fail",
//             message: "Cannot get Product"
//         });
//     }
// }
export const updateProduct = async (req, res, next) => {
    try {
        const { productID } = req.params;
        console.log(productID);
        const { productOriginalPrice, productDiscountPrice, productDescription, productRating } = req.body;
        console.log(productDescription, productOriginalPrice, productDiscountPrice, productRating);
        const originalPrice = Number(productOriginalPrice);
        const discountPrice = Number(productDiscountPrice);
        const rating = Number(productRating);
        const data = {
            productDescription: { S: productDescription },
            productDiscountPrice: { N: discountPrice.toString() }, // Convert back to string after conversion
            productOriginalPrice: { N: originalPrice.toString() }, // Convert back to string after conversion
            productRating: { N: rating.toString() } // Convert back to string after conversion
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

        const data = Items.map(item => {
            const newItem = {};
            Object.entries(item).forEach(([key, value]) => {
                if (typeof value === 'object' && value.hasOwnProperty('S')) {
                    newItem[key] = value['S'];
                } else if (typeof value === 'object' && value.hasOwnProperty('N')) {
                    newItem[key] = parseInt(value['N'], 10);
                } else if (Array.isArray(value)) {
                    newItem[key] = value.map(entry => {
                        if (typeof entry === 'object' && entry.hasOwnProperty('S')) {
                            return entry['S'];
                        } else if (typeof entry === 'object' && entry.hasOwnProperty('N')) {
                            return parseInt(entry['N'], 10);
                        }
                        return entry;
                    });
                } else if (typeof value === 'object' && value.hasOwnProperty('L')) {
                    newItem[key] = value['L'].map(entry => {
                        if (typeof entry === 'object' && entry.hasOwnProperty('S')) {
                            return entry['S'];
                        } else if (typeof entry === 'object' && entry.hasOwnProperty('N')) {
                            return parseInt(entry['N'], 10);
                        }
                        return entry;
                    });
                } else {
                    newItem[key] = value;
                }
            });
            return newItem;
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


export const getProductById = async (req, res, next) => {
    try {
        const { productID } = req.params;
        const command = new GetItemCommand({
            TableName: PRODUCT_TABLE_NAME,
            Key: {
                productID: { S: productID }
            }
        });
        const { Item } = await productClient.send(command);

        if (!Item) {
            return res.status(404).json({
                status: "fail",
                message: "Product not found"
            });
        }

        const data = {};
        Object.entries(Item).forEach(([key, value]) => {
            if (typeof value === 'object' && value.hasOwnProperty('S')) {
                data[key] = value['S'];
            } else if (typeof value === 'object' && value.hasOwnProperty('N')) {
                data[key] = parseInt(value['N'], 10);
            } else if (Array.isArray(value)) {
                data[key] = value.map(entry => {
                    if (typeof entry === 'object' && entry.hasOwnProperty('S')) {
                        return entry['S'];
                    } else if (typeof entry === 'object' && entry.hasOwnProperty('N')) {
                        return parseInt(entry['N'], 10);
                    }
                    return entry;
                });
            } else if (typeof value === 'object' && value.hasOwnProperty('L')) {
                data[key] = value['L'].map(entry => {
                    if (typeof entry === 'object' && entry.hasOwnProperty('S')) {
                        return entry['S'];
                    } else if (typeof entry === 'object' && entry.hasOwnProperty('N')) {
                        return parseInt(entry['N'], 10);
                    }
                    return entry;
                });
            } else {
                data[key] = value;
            }
        });

        return res.status(200).json({
            status: "success",
            data
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "fail",
            message: "Cannot get Product"
        });
    }
}
