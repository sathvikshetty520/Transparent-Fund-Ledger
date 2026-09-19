const authService = require("../services/auth.service");

const { success } = require("../utils/response");

async function register(req, res) {
  const result = await authService.register(req.body);

  return success(res, result, 201);
}

async function login(req, res) {
  const result = await authService.login(req.body);

  return success(res, result);
}

async function me(req, res) {
  const user = await authService.getCurrentUser(
    req.user.id
  );

  return success(res, user);
}

module.exports = {
  register,
  login,
  me
};