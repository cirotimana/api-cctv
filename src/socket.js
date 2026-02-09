const socketIo = require("socket.io");
require("dotenv").config();

let io;

let origin = process.env.CORS_ORIGIN;
try {
  if (typeof origin === 'string') {
    origin = JSON.parse(origin);
  }
} catch (error) {
  console.warn('Failed to parse CORS_ORIGIN in socket.js, using as string:', error);
}

console.log("CORS_ORIGIN:", origin);

const setupSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: origin,
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
