const jwt = require("jsonwebtoken");
const User = require("../models/userModel")
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("./catchAsyncError");

//user login or not
exports.isAuthenticatedUser = catchAsyncError(async(req,res,next)=>{

    const {token} = req.cookies;
    if(!token){
        return next(new ErrorHandler("Please Login to access this resource",401))
    }
    const decodeData =  jwt.verify(token,process.env.JWT_SECRET)
    req.user = await User.findById(decodeData.id)
    next();

})

//user role 
exports.userRoles = (...roles) => {
    return (req,res,next) =>{

        if(!roles.includes(req.user.role))
        {
           return next(new ErrorHandler(`Role: ${req.user.role} is not allowed to access this route`,403))
        }
    next();
    }
}