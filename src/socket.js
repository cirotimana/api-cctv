const socketIo = require("socket.io");
require("dotenv").config();
const config = require("../config");

let io;

console.log("CORS_ORIGIN:", config.CORS_ORIGIN);

const setupSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: config.CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io no está inicializado");
  }
  return io;
};

module.exports = { setupSocket, getIo };
