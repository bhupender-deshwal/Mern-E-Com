const ErrorHandler = require("../utils/errorhandler");
module.exports = (err, req,res,next)=>{
   err.statusCode = err.statusCode || 500;
   err.msg = err.message || "Internal Server Error";
//Wrong Mongo db Error
    if(err.name ==="CastError"){
        const message = `Resource not found Invalid: ${err.path}`;
        err=new ErrorHandler(message,400)
    }

    //mongoose duplicate key error
    if(err.code === 11000)
    {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`
        err=new ErrorHandler(message,400)
    }
//Wrong JWT Error
if(err.name ==="JsonwebTokenError"){
    const message = `Json Web Token is invalid, Try again`;
    err=new ErrorHandler(message,400)
}

//JWT Expire Error
if(err.name ==="TokenExpiredError"){
    const message = `Json Web Token is Expired, Try again`;
    err=new ErrorHandler(message,400)
}


   res.status(err.statusCode).json({
       success: false,
       message:err.msg
   })
}