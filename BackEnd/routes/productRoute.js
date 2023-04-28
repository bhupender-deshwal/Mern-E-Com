const express = require("express");
const { getAllProducts,createProduct,updateProduct, deleteProduct, getSingleProduct, createProductReview, getProductReviews, deleteProductReview } = require("../controllers/productController");
const {isAuthenticatedUser,userRoles} = require("../middleware/auth")

const router = express.Router();

router.route("/products").get(getAllProducts);
router.route("/admin/products/new").post(isAuthenticatedUser,userRoles("admin"),createProduct);
router.route("/admin/products/:id").put(isAuthenticatedUser,userRoles("admin"),updateProduct).delete(isAuthenticatedUser,userRoles("admin"),deleteProduct)
router.route("/product/:id").get(getSingleProduct);
router.route("/review").put(isAuthenticatedUser,createProductReview);
router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser,deleteProductReview);


module.exports = router;