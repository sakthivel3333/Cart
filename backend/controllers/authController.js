const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/userModel');
const sendEmail = require('../utils/email');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwt');
const crypto = require('crypto');

// Register a new user - api/v1/register
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password, avatar } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar
    });

    sendToken(user, 201, res);
});

// Login a user - api/v1/login
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Please enter email & password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.isValidPassword(password))) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    sendToken(user, 201, res);
});

// Logout - api/v1/logout
exports.logoutUser = (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })
        .status(200)
        .json({
            success: true,
            message: "Logged out"
        });
};

// Forgot password - api/v1/password/forgot
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler('User not found with this email', 404));
    }

    const resetToken = user.getResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset URL is as follows:\n\n${resetUrl}\n\nIf you have not requested this email, please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Recovery',
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

// Reset password - /api/v1/password/reset/:token
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid or expired', 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    sendToken(user, 201, res);
});

// Get user profile - api/v1/myprofile
exports.getUserProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user
    });
});

// Change password - api/v1/password/change
exports.changePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check if the old password is correct
    if (!await user.isValidPassword(req.body.oldPassword)) {
        return next(new ErrorHandler('Old Password Is Incorrect', 401));
    }

    // Assign the new password
    user.password = req.body.password;
    await user.save();
    
    res.status(200).json({
        success: true,
        message: 'Password changed successfully'
    });
});

//Update Profile   

exports.updateProfile = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email

    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new: true,
        runValidators: true

    })
    res.status(200).json({
        success: true,
        user
    })
})

//admin: Get All Users - api/v1/admin/user
exports.getAllUsers = catchAsyncError(async(req,res,next) => {
    const users = await User.find()
    res.status(200).json({
        success: true,
        users

    })
})

//Admin: Get Specific User -- {{base_url}}/api/v1/admin/user/66960b22b4989075be27ceac
exports.getUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`User not found with this Id ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        user 
    });
});

//Admin: Update User -- {{base_url}}/api/v1/admin/user/:id
exports.updateUser = catchAsyncError(async(req,res,next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role

    }
    const user = await User.findByIdAndUpdate(req.params.id, newUserData,{
        new: true,
        runValidators: true

    })
    res.status(200).json({
        success: true,
        user
    });
});

// Admin: Delete User
exports.deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
        return next(new ErrorHandler(`User not found with this Id: ${req.params.id}`, 404));
    }

    // Using deleteOne method on the found user object
    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: 'User deleted successfully'   
    });
});       