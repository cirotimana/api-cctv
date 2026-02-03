const config = require("../../../config.json");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const createToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload, process.env.JWT_SECRET || config.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || config.JWT_EXPIRES_IN,
      },
      (error, token) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      }
    );
  });
};

module.exports = { createToken };