// test-socket-client.js
// const { io } = require("socket.io-client");
import { io } from "socket.io-client";

const socket = io(
  "https://believerappbackend.yellowbeach-624b30e5.centralindia.azurecontainerapps.io",
  {
    transports: ["websocket", "polling"],
    path: "/socket.io/",
  }
);

socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server!");

  socket.on("filteredDataUpdate", (data) => {
    console.log("📊 Filtered Data Update:", data);
  });

  socket.disconnect();
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
});
