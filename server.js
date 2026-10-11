import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDb from "./config/db.js";

import ideaRouter from "./routes/ideaRoutes.js";
import authRouter from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8053;

// connect to mongodb

connectDb();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ urlencoded: true }));
app.use(cookieParser());

// Routes
app.use("/api/ideas", ideaRouter);
app.use("/api/auth", authRouter);

// Error Handling
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
