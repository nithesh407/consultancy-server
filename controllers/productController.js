
export const getProducts = (req, res, next) => {
    return res.status(200).json({
        status: "success",
        data: "All Products"
    })
}