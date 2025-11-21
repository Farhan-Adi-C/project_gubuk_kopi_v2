import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Saat client Next.js connect
io.on("connection", socket => {
  console.log("Client connected:", socket.id);
});

// Endpoint untuk Laravel POST order
app.post("/broadcast-order", (req, res) => {
  const { order } = req.body;
  if (!order) return res.status(400).json({ success: false, message: "Order missing" });

  // Broadcast ke semua client Next.js
  io.emit("order_created", order);

  return res.json({ success: true, message: "Order broadcasted" });
});

server.listen(4000, () => console.log("🚀 Socket.io server running on port 4000"));
