import userModel from "../models/userModel.js"
import AppError from "../lib/helpers/appError.js"

export const getUsers = async (req, res, next) => {
    try {
        const users = await userModel.find().select('-__v');
        if (!users) return next(AppError('No Users Found!', 404))
        return res.status(200).json({
            status: "success",
            data: users
        })
    } catch (err) {
        return res.status(500).json({
            status: "fail",
            message: 'Failed to Fetch Users',
            err
        })
    }
}

export const addUser = async (req, res, next) => {
    try {
        const users = await userModel.create(req.body)
        return res.status(201).json({
            status: "success",
            data: users
        })
    } catch (err) {
        return res.status(500).json({
            status: "fail",
            message: 'Failed to Create User',
            err
        })
    }
}