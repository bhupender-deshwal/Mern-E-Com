const express = require("express");
const {registerUser, loginUser, logout, forgotPassword, resetPassword,
     getUserDetails, updatePassword, updateProfile, getSingleUser,getAllUsers, updateRole, deleteUser} = require("../controllers/userController");
const router = express.Router();
const {isAuthenticatedUser,userRoles} = require("../middleware/auth")


router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logout);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/password/update").put(isAuthenticatedUser,updatePassword);
router.route("/profile/update").put(isAuthenticatedUser,updateProfile);
router.route("/admin/users").get(isAuthenticatedUser,userRoles("admin"),getAllUsers);
router.route("/admin/user/:id").get(isAuthenticatedUser,userRoles("admin"),getSingleUser);
router.route("/admin/update/role/:id").put(isAuthenticatedUser,userRoles("admin"),updateRole);
router.route("/admin/delete/user/:id").post(isAuthenticatedUser,userRoles("admin"),deleteUser);


module.exports = router;