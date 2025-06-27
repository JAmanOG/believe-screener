// test-socket-client.js
const { io } = require("socket.io-client");

const socket = io("https://believerappbackend.yellowbeach-624b30e5.centralindia.azurecontainerapps.io", {
  transports: ["websocket", "polling"],
  path: "/socket.io/",
});

socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server!");
  socket.disconnect();
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
});