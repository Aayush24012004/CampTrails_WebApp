const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const controller = require("../controllers/users");
const { storeReturnTo } = require("../isLoggedIn");
router
  .route("/register")
  .get(controller.renderRegisterForm)
  .post(catchAsync(controller.createNewUser));
router
  .route("/login")
  .get(controller.renderSignInForm)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    controller.login
  );
router.get("/logout", controller.logout);
module.exports = router;
