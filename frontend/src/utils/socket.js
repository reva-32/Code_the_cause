// src/utils/socket.js

// Fake in-memory socket (NO backend, NO websocket)
const fakeSocket = {
  on: () => {},
  off: () => {},
  emit: () => {},
  once: () => {},
  connected: false,
};

export const connectSocket = () => {
  // Socket intentionally disabled
  if (import.meta.env.VITE_ENABLE_SOCKET === "true") {
    console.warn("Socket enabled flag is true, but no backend is running");
  }
  return fakeSocket;
};

export const getSocket = () => {
  return fakeSocket;
};

export default fakeSocket;
