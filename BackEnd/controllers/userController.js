const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const User = require("../models/userModel")
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto");
const catchAsyncError = require("../middleware/catchAsyncError");
//Register a User
exports.registerUser = catchAsyncErrors(async (req,res,next) =>{
    const {name,email,password} = req.body;
    const user = await User.create({
        name,email,password,
    })
   sendToken(user,201,res);
})

//Login User
exports.loginUser = catchAsyncErrors(async (req,res,next)=>{
    const {email,password} =req.body;

    //checking if user has given password and email both

    if(!email || !password){
        return next(new ErrorHandler("Please Enter Email & Password",400))
    }
    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid email or password",401))
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched)
    {
        return next(new ErrorHandler("Invalid email or password",401))
    }
   sendToken(user,200,res);
})

//LogOut User
exports.logout = catchAsyncErrors(async (req,res,next)=>{
    res.cookie("token",null,{
        expires: new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({
        success: true,
        message: "Looged Out"
    })
})
// forgot password

exports.forgotPassword = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new ErrorHandler("User not found",404));
    }
    // Get ResetPassword token
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it`;

    try{
        await sendEmail({
            email: user.email,
            subject: `Ecommerce password Recovery`,
            message,
        })

        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} succesfully`
        })

    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswoedExpire = undefined;
        await user.save({validateBeforeSave:false});
        return next(new ErrorHandler(error.message,500));
    }
})

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req,res,next)=>{
    //creating token hash
    const  resetPasswordToken = crypto.createHash("sha256")
                                 .update(req.params.token)
                                 .digest("hex");

        const  user = await User.findOne({
            resetPasswordToken,
            resetPasswoedExpire: {$gt: Date.now() },
        });

        if(!user){
            return next(new ErrorHandler("Reset Password Token is invalid or has been expired",400));
        }

        if(req.body.password !== req.body.confirmPassword){
            return next(new ErrorHandler("Password does not match",400));
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswoedExpire = undefined;
        await user.save();
        sendToken(user,200,res)

})

//Get user details

exports.getUserDetails = catchAsyncError(async (req, res, next)=>{

    const user =await User.findById(req.user.id)
    res.status(200).json({
        success: true,
       user
    })

})

//update user Password

exports.updatePassword = catchAsyncError(async (req, res, next)=>{

    const user =await User.findById(req.user.id).select("+password")

    const isPasswordMatched = await user.comparePassword(req.body.oldpassword);

    if(!isPasswordMatched)
    {
        return next(new ErrorHandler("Old Password is incorrect",400))
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler(" Confirm Password does not match",400));
    }
    user.password = req.body.newPassword

   await user.save();
   sendToken(user,200,res);

})

//update user Profile

exports.updateProfile = catchAsyncError(async (req, res, next)=>{

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }

    //change profile pic later and coudinary

    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new: true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        success:true,
        message:"Update profile successfully"
    })

})

// Get all Users by admin

exports.getAllUsers = catchAsyncError(async (req,res,next)=>{

        const users = await User.find();
        if(!users){
            return next(new ErrorHandler(`User does not exist`))
        }
        res.status(200).json({
            success:true,
            users
        })
    })

    // Get single Users by admin

exports.getSingleUser = catchAsyncError(async (req,res,next)=>{

        const user = await User.findById(req.params.id);

        if(!user){
            return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`))
        }

        res.status(200).json({
            success:true,
            user
        })
    })


    //update user Role--- admin

exports.updateRole = catchAsyncError(async (req, res, next)=>{

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData,{
        new: true,
        runValidators:true,
        useFindAndModify:false,
    })
    if(!user){
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`))
    }
    res.status(200).json({
        success:true,
        message:"User role update successfully",
      
    })

})

 //delete user ---admin

 exports.deleteUser = catchAsyncError(async (req, res, next)=>{


    const user = await User.findById(req.params.id)
    if(!user){
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`))
    }
    await user.remove();
    res.status(200).json({
        success:true,
        message:"User deleted successfully"
    })

})