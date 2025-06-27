import { io } from "socket.io-client";

// Use http and prioritize polling for React Native/Expo
const socket = io(`https://l7s75wk0-3000.inc1.devtunnels.ms/`, {
    path: "/socket.io/",
    transports: ["polling", "websocket"], // Try polling first, then websocket
    autoConnect: false, // Let the context handle connection
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    forceNew: true, // Create a new connection
});

export default socket;