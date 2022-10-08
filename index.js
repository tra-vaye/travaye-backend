// Entry point of the server
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRouter from "./routes/userRoutes.js";
import businessRouter from "./routes/businessRoutes.js";

// Constants
dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use("/api/user", userRouter);
app.use("/api/business", businessRouter);

// Server Listener
async function connectDbAndListen() {
  try {
    mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB Connected");
    app.listen(process.env.PORT, () => {
      console.log(`Listening on http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error.message);
  }
}
await connectDbAndListen();
