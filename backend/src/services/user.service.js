const db = require("../config/db");
const userModel = require("../models/user.model");

async function getAllUsers() {
  return userModel.findAll(db);
}

module.exports = {
  getAllUsers
};