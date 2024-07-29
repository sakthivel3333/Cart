const mongoose = require('mongoose');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');
const APIFeatures = require('../utils/apiFeatures');
//const { promises } = require('nodemailer/lib/xoauth2');

// Get Products - /api/v1/products

exports.getProducts = catchAsyncError(async (req, res, next) => {
    const resPerPage = 4;
    const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter().paginate(resPerPage);
    //return next(new ErrorHandler ('Unable to send products',400))
    const products = await apiFeatures.query;
   // await new Promise(resolve => setTimeout(resolve, 1000))
    res.status(200).json({
        success: true,
        count: products.length,
        products
    });
});

// Create Product - /api/v1/products/new

exports.newProduct = catchAsyncError(async (req, res, next) => {
    req.body.user = req.user.id;
    console.log('Request body:', req.body)
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    });
});

// Get Single Product - /api/v1/products/:id

exports.getsingleProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if the id is a valid ObjectId

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new ErrorHandler('Product Not Found', 400));
        }

        const product = await Product.findById(id);

        if (!product) {
            return next(new ErrorHandler('Product Not Found', 404));
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

// Update Product - /api/v1/products/:id

exports.updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if the id is a valid ObjectId

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new ErrorHandler('Product Not Found', 400));
        }

        let product = await Product.findById(id);

        if (!product) {
            return next(new ErrorHandler('Product Not Found', 404));
        }

        product = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

// Delete Product - /api/v1/products/:id

exports.deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if the id is a valid ObjectId

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new ErrorHandler('Product Not Found', 404));
        }

        const product = await Product.findById(id);

        if (!product) {
            return next(new ErrorHandler('Product Not Found', 404));
        }

        await Product.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Product Deleted"
        });
    } catch (error) {
        next(error);
    }
};

// Create Review - api/v1/review

exports.createReview = catchAsyncError(async (req, res, next) => {
    const { productId, rating, comment } = req.body;
    const review = {
        user: req.user.id,
        rating,
        comment
    }

    // Find the product by ID

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    // Check if the user has already reviewed the product

    const isReviewed = product.reviews.find(
        (review) => review.user.toString() === req.user.id.toString()
    );

    if (isReviewed) {
        // Update the existing review

        product.reviews.forEach((review) => {
            if (review.user.toString() === req.user.id.toString()) {
                review.comment = comment;
                review.rating = rating;
            }
        });
    } else {
        // Add a new review

        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    // Calculate the average rating

    product.ratings = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;
    product.ratings = isNaN(product.ratings) ? 0 : product.ratings;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true
    });
});


//Get Reviews - api/v1/reviews?id={productId}


exports.getReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

exports.deleteReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    // Filtering the reviews which do not match the deleting review's id
    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());

    // Number of reviews
    const numOfReviews = reviews.length;

    // Calculate the average rating with the filtered reviews
    let ratings = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    ratings = isNaN(ratings) ? 0 : ratings;

    // Save the product document
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        numOfReviews,
        ratings
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        message: 'Review has been deleted'
    });
});
