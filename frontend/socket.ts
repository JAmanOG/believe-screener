import { io } from "socket.io-client";

const socket = io(`https://believerappbackend.yellowbeach-624b30e5.centralindia.azurecontainerapps.io`, {
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 5000,
    timeout: 100000,
    forceNew: true,
    secure: true,
});

export default socket;