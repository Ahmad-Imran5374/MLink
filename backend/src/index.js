import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { app,server } from "./lib/socket.js";
import path from "path";
dotenv.config();
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
const PORT = process.env.PORT;
const __dirname = path.resolve();
if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(__dirname,"../frontend/dist"))); 

  app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
  })
}
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoute);


server.listen(PORT, () => {
  console.log(`Server is running on Port:${PORT}`);
  connectDB();
});
