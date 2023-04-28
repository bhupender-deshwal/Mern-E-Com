const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,"Please Enter Your Name"],
        maxlength:[30,"Name cannot exceed 30 characters"],
        minlength:[4,"Name should have more than 4 characters"]
    },
    email:{
        type:String,
        required:[true,"Please Enter Your Email"],
        unique:true,
        validate:[validator.isEmail,"Please Enter a valid Email"]
    },
    password:{
        type:String,
        required:[true,"Please Enter Your Password"],
        minlength:[8,"Password should be greater than 8 characters"],
        select:false,
    },
    avatar:{
        public_id:{
            type:String,
           default:"this is a sample id"
        },
        url:{
            type:String,
            default:"profilepicUrl"
        }
    },
    role:{
        type:String,
        default:"user"
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,

})
userSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
})
//JWT Token
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    })
}

// compare password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}


//Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function (){
//generating token
    const resetToken = crypto.randomBytes(20).toString("hex");
    //Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now()+ 15*60*1000;
    return resetToken;
}



module.exports = mongoose.model("user",userSchema)