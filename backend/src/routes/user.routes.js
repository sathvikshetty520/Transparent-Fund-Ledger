const express = require("express");

const userController = require("../controllers/user.controller");
const {
  authenticate,
  authorize
} = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(userController.getUsers)
);

module.exports = router;