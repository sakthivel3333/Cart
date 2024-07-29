const catchAsyncError = require('../middlewares/catchAsyncError');
const Order = require('../models/orderModel');
const ErrorHandler = require('../utils/errorHandler'); // Ensure ErrorHandler is imported
const Product = require('../models/productModel');

// Create New Order - api/v1/order/new
exports.newOrder = catchAsyncError(async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    // Validate request body here if necessary

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.userId // Ensure `userId` is provided in the request
    });

    res.status(201).json({
        success: true,
        order
    });
});

// Get Single Order - api/v1/order/:id
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
        return next(new ErrorHandler(`Order Not Found With This Id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        order
    });
});

// Get Logged In User Orders - api/v1/orders/myorders
exports.myOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({ user: req.userId });

    if (!orders.length) {
        return next(new ErrorHandler('Orders not found for this user', 404));
    }

    res.status(200).json({
        success: true,
        orders
    });
});

// Admin: Get All Orders - api/v1/orders
exports.orders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    });
});

// Admin: Update Order / Order Status - api/v1/order/:id
exports.updateOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (order.orderStatus=='Delivered') {
        return next(new ErrorHandler('Order has been already delivered!',400));
    }
//Updateing the product stock of the each items 
   order.orderItems.forEach( async orderItem => {
       await updateStock(orderItem.product, orderItem.quantity)

    });

    order.orderStatus = req.body.orderStatus;
    order.deliveredAt = Date.now();
    await order.save();

   res.status(200).json({
       success: true 
   })
});
async function updateStock (productId, quantity){
    const product = await Product.findById(productId);
    product.stock = product.stock-quantity;
   product.save({validateBeforeSave: false})
 } 

 //Admin: Delete Order - api/v1/order/:id

 exports.deleteOrder = catchAsyncError(async (req,res,next)=>{
    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(new ErrorHandler(`Order Not Found With This Id: ${req.params.id}`, 404));
    }
    await order.deleteOne();
    res.status(200).json({
        success:true
        
    })

 })