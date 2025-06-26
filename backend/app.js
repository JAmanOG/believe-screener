import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { createServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { individualComponent } from './fetching.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'private-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.pem'))
};

// Create HTTP server
const server = createServer(app);
const httpsServer = createHttpsServer(sslOptions, app);


// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'], // Support both transports
  allowEIO3: true, // Support older clients
});

app.use(cors());
app.use(express.json());
// Serve static files from the "public" directory
// app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const filteredDataPath = path.join(__dirname, 'filteredDataWithOther.json');

// Function to read and emit filtered data
function emitFilteredData() {
  try {
    if (fs.existsSync(filteredDataPath)) {
      const data = fs.readFileSync(filteredDataPath, 'utf8');
      const parsedData = JSON.parse(data);
      
      // Emit to all connected clients
      io.emit('filteredDataUpdate', {
        timestamp: new Date().toISOString(),
        data: parsedData
      });
      
      console.log(`Emitted filtered data to ${io.engine.clientsCount} connected clients`);
    } else {
      console.log('Filtered data file not found');
    }
  } catch (error) {
    console.error('Error reading/emitting filtered data:', error);
  }
}

// Watch for file changes and emit data when file is updated
if (fs.existsSync(filteredDataPath)) {
  console.log('Watching filtered data file for changes...');
  
  fs.watchFile(filteredDataPath, (curr, prev) => {
    console.log('Filtered data file changed, emitting update...');
    emitFilteredData();
  });
} else {
  console.log('Filtered data file not found, will start watching when it exists');
}

// Emit data every 10 seconds (continuous updates)
setInterval(() => {
  if (io.engine.clientsCount > 0) {
    emitFilteredData();
  }
}, 5000000); // 10 seconds


io.on('connection', (socket) => {
  console.log('🔗 New client connected')

  setTimeout(() => {
    emitFilteredData();
  }, 4000);
  
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected');
  });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running', port: PORT });
});

app.post('/api/individualTokenData', async (req, res) => {
  const {tokenData} = req.body;
  if (!tokenData || Object.keys(tokenData).length === 0) {
    return res.status(400).json({ error: 'Token data is required' });
  }

  const result = await individualComponent(tokenData);
  if (!result) {
    return res.status(500).json({ error: 'Failed to process individual component' });
  }

  res.json({ data: result });
});



// Listen on the HTTP server, not the Express app
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
});
