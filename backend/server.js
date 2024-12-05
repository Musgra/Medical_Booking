import express from "express";
import cors from "cors";
import "dotenv/config";
import { Server } from "socket.io"; // Import socket.io
import http from "http"; // Import http module
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import sendEmailRouter from "./routes/sendEmail.js";

// app config
const app = express();
const port = process.env.PORT || 4000;

// Create an HTTP server and attach socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Hoặc cụ thể nguồn frontend của bạn
    methods: ["GET", "POST"],
  },
  pingInterval: 25000, // Khoảng thời gian gửi ping
  pingTimeout: 60000,
});

// Kết nối MongoDB và Cloudinary
connectDB();
connectCloudinary();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// API endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/email", sendEmailRouter);

// WebSocket logic
io.on("connection", (socket) => {
  socket.on("joinDoctorRoom", (docId) => {
    if (docId && !socket.rooms.has(docId)) {
      // Kiểm tra nếu chưa vào phòng
      socket.join(docId);
      console.log(`Doctor ${docId} joined room`);
    } else {
      console.log(`Doctor ${docId} is already in the room`);
    }
  });

  // Người dùng tham gia phòng
  socket.on("joinUserRoom", (userId) => {
    if (userId && !socket.rooms.has(userId)) {
      // Kiểm tra nếu chưa vào phòng
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    } else {
      console.log(`User ${userId} is already in the room`);
    }
  });

  // Lắng nghe sự kiện từ client
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Home route
app.get("/", (req, res) => {
  res.send("Hello World 1213");
});

// Start the server
server.listen(port, () => console.log(`Server is running on port: ${port}`));

export { io };
