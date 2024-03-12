import multer from "multer"

const upload = multer();

import uploadFileToS3 from "../lib/helpers/s3.helper.js"

export const getProducts = (req, res, next) => {
    return res.status(200).json({
        status: "success",
        data: "All Products"
    })
}

export const addProducts = async (req, res, next) => {
    try {
        // Use multer middleware to parse form data containing the file
        upload.single('file')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status: "fail",
                    message: "Error uploading file"
                });
            }

            // Access the form data directly from req object
            const formData = req.body;

            // Access the uploaded file from req.file
            const file = req.file;

            if (!file) {
                return res.status(404).json({
                    status: "fail",
                    message: "No File found"
                });
            }

            // Convert file buffer to a Buffer object
            const buffer = Buffer.from(file.buffer);

            // Upload the file to S3
            const { name } = formData;
            const imageUrl = await uploadFileToS3(buffer, file.originalname, 'products');
            console.log(name);
            return res.status(201).json({
                status: "success",
                imageUrl
            });
        });
    } catch (err) {
        return res.status(500).json({
            status: "fail",
            message: "Cannot upload file"
        });
    }
};

