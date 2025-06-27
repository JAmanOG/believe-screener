import { io } from "socket.io-client";

// Use http and prioritize polling for React Native/Expo
const socket = io(`https://believerappbackend.yellowbeach-624b30e5.centralindia.azurecontainerapps.io`, {
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    autoConnect: false, // Let the context handle connection
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 5000,
    timeout: 100000,
    forceNew: true, // Create a new connection
    secure: true,
});

export default socket;