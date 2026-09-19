const userService = require("../services/user.service");
const { success } = require("../utils/response");

async function getUsers(req, res) {
  const users = await userService.getAllUsers();

  return success(res, users);
}

module.exports = {
  getUsers
};