const { connect } = require("./config/database");
const cookieParser = require("cookie-parser");
const { setupSocket } = require("./socket");
const config = require("../config.json");
const routes = require("./routes");
const express = require("express");
const morgan = require("morgan");
const http = require("http");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || config.APP_PORT;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

console.log(process.env.CORS_ORIGIN || config.CORS_ORIGIN); 

// CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || config.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Static File Serving
const staticPaths = [
  { url: "/attachments", path: "../src/assets/attachments" },
  { url: "/uploads", path: "../src/assets/uploads" },
  { url: "/images", path: "../src/assets/images" },
  { url: "/public", path: "../public" },
];

staticPaths.forEach(({ url, path: staticPath }) => {
  app.use(url, express.static(path.join(__dirname, staticPath)));
});

// Socket.io Setup
const io = setupSocket(server);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/v1", routes);

// Server Start
server.listen(port, () => {
  connect();
  console.log(`Server listening on port ${port}!`);
});