require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const ApiError = require("./utils/ApiError");
const errorHandler = require("./utils/errorHandler");
const { connectMongoDB } = require("./connection");
const userRouter = require("./routers/userRoute");

const app = express();
const PORT = process.env.PORT || 9000;
const START_POINT = process.env.START_POINT;
const MONGO_URI = process.env.MONGO_URI;
const NODE_ENV = process.env.NODE_ENV;

connectMongoDB(MONGO_URI);

app.use(express.json());
app.use(cors());
app.use(cookieParser());
if (NODE_ENV == "development") {
  app.use(morgan("dev"));
}

app.get(`/${START_POINT}/api`, (req, res) => {
  res.send(`${PORT} running...`);
});

app.use(`/${START_POINT}/api/user`, userRouter);

app.all("*", (req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this Server!`));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running port ${PORT}`);
});
