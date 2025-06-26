import { io } from "socket.io-client";

// Use http and prioritize polling for React Native/Expo
const socket = io(`http://${process.env.EXPO_SERVER_URL}:3000`, {
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