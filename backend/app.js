import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { createServer } from 'http';
import { Server } from "socket.io";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('🔗 New client connected')
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected');
  });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running', port: PORT });
});

// Listen on the HTTP server, not the Express app
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
});
