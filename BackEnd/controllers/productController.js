const Product =require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsynErrors = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apifeatures");
//Create Product ---admin
exports.createProduct =catchAsynErrors(async (req,res,next)=>{
   req.body.user = req.user.id
   const product = await Product.create(req.body);
   res.status(201).json({
      success:true,
      product
   });
});
//Get all Products
exports.getAllProducts = catchAsynErrors(async (req,res)=>{

   const resultPerPage = 5;
   const productCount = await Product.countDocuments();

 const apifeatures = new ApiFeatures(Product.find(),req.query).search().filter().pagination(resultPerPage);

const products = await apifeatures.query;
    res.status(200).json({
       success:true,
       products,
       productCount
    })
 })
 //update product
 exports.updateProduct = catchAsynErrors(async (req,res,next)=>{

   let product = await Product.findById(req.params.id);

   if(!product){
      return next(new ErrorHandler("Product not fount",404))
   }
  product=await Product.findByIdAndUpdate(req.params.id,req.body,{
     new:true,
     runValidators:true,
     useFindAndModify:false
  })
  return res.status(200).json({
   success:true,
   product 
})
 })

 //delete product
 exports.deleteProduct =catchAsynErrors(async (req,res)=>{
   let product = await Product.findById(req.params.id);
   if(!product){
      return next(new ErrorHandler("Product not fount",404))
   }
     await product.remove();
      return res.status(200).json({
         success:true,
        message:"Product deleted successfully" 
      })
    })

    //get single product details

    exports.getSingleProduct = catchAsynErrors(async (req,res,next)=>{

      let product = await Product.findById(req.params.id);
   
      if(!product){
         return next(new ErrorHandler("Product not fount",404))
      }
   
     return res.status(200).json({
      success:true,
      product 
   })
    })

    //Create New Review or Update the review
    exports.createProductReview = catchAsynErrors(async (req,res,next)=>{
       const {rating, comment, productId} =req.body;
      const review = {
         user: req.user.id,
         name: req.user.name,
         rating: Number(rating),
         comment
      };
      const product = await Product.findById(productId);
      if(!product){
         return next(new ErrorHandler("Product not fount",404))
      }
   

      const isReviewed = product.reviews.find(rev => rev.user.toString()=== req.user.id)
      if(isReviewed){
         product.reviews.forEach(rev => {
            if(rev.user.toString() === req.user.id.toString())
            (rev.rating = rating), (rev.comment = comment)
         });
      }
      else{
         product.reviews.push(review)
         product.numOfReviews = product.reviews.length
      }

      let avg=0;
      product.reviews.forEach((rev)=>{
         avg += rev.rating;
      })
      product.ratings = avg / product.reviews.length;

      await product.save({validateBeforeSave:false});

      res.status(200).json({
         success:true
      })

    })

    //Get All Reviews of a product

    exports.getProductReviews = catchAsynErrors(async (req,res,next)=>{
      const product = await Product.findById(req.query.id);
      if(!product){
         return next(new ErrorHandler("Product not fount",404))
      }

      res.status(200).json({
         success:true,
         reviews:product.reviews
      })
    })

    //Delete Review
    exports.deleteProductReview = catchAsynErrors(async (req,res,next)=>{
      const product = await Product.findById(req.query.productid);
      if(!product){
         return next(new ErrorHandler("Product not fount",404))
      }
      const reviews = product.reviews.filter(
         (rev)=> rev._id.toString() !== req.query.id.toString()
      )

      let avg=0;
      reviews.forEach((rev)=>{
         avg += rev.rating;
      })
      let ratings = avg /reviews.length;
      const numOfReviews = reviews.length;
      if(isNaN(ratings))
      ratings=0

      await Product.findByIdAndUpdate(req.query.productid,{
         reviews,ratings,numOfReviews
      },{
         new:true,
         runValidators:true,
         useFindAndModify:true
      })


      res.status(200).json({
         success:true,
     
      })
    })