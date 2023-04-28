const express = require("express");
const { newOrder, getOrderDetails, myOrders, getAllOrders, deleteOrder, updateOrderStatus } = require("../controllers/ordersController");
const router = express.Router();
const {isAuthenticatedUser,userRoles} = require("../middleware/auth")

    router.route("/order/new").post(isAuthenticatedUser,newOrder)
    router.route("/order/me").get(isAuthenticatedUser,myOrders);
    router.route("/order/:id").get(isAuthenticatedUser,getOrderDetails);
    
    router.route("/admin/orders").get(isAuthenticatedUser,userRoles("admin"),getAllOrders);
    router.route("/admin/order/:id").put(isAuthenticatedUser,userRoles("admin"),updateOrderStatus).delete(isAuthenticatedUser,userRoles("admin"),deleteOrder);

module.exports = router;