const express = require('express');
const { getProducts, newProduct, getsingleProduct, updateProduct, deleteProduct, createReview, getReviewws, getReviews, deleteReviews } = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/authenticate');
const router = express.Router();

router.route('/products').get( getProducts);
router.route('/product/:id').get(getsingleProduct);
router.route('/product/:id').put(updateProduct);
router.route('/product/:id').delete(deleteProduct);

router.route('/review').put(isAuthenticatedUser, createReview)
router.route('/reviews').get(getReviews)
router.route('/reviews').delete(deleteReviews);

//Admin routes

router.route('/products/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);

module.exports = router;
