const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const env = require("../config/env");
const db = require("../config/db");
const ApiError = require("../utils/ApiError");
const userModel = require("../models/user.model");

const SALT_ROUNDS = 12;

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );
}

async function register({
  name,
  email,
  password,
  role
}) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await userModel.findByEmail(
    db,
    normalizedEmail
  );

  if (existingUser) {
    throw ApiError.conflict(
      "An account with this email already exists"
    );
  }

  const passwordHash = await bcrypt.hash(
    password,
    SALT_ROUNDS
  );

  let user;

  try {
    user = await userModel.create(
      db,
      {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role
      }
    );
  } catch (error) {
    if (error.code === "23505") {
      throw ApiError.conflict(
        "An account with this email already exists"
      );
    }

    throw error;
  }

  return {
    token: generateToken(user),
    user: sanitizeUser(user)
  };
}

async function login({
  email,
  password
}) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await userModel.findByEmail(
    db,
    normalizedEmail
  );

  if (!user) {
    throw ApiError.unauthenticated(
      "Invalid email or password"
    );
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw ApiError.unauthenticated(
      "Invalid email or password"
    );
  }

  return {
    token: generateToken(user),
    user: sanitizeUser(user)
  };
}

async function getCurrentUser(userId) {
  const user = await userModel.findById(
    db,
    userId
  );

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return sanitizeUser(user);
}

module.exports = {
  register,
  login,
  getCurrentUser
};