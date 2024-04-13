import { io } from "socket.io-client";

export const SocketConnection = (accessToken: string) => {
  const socket = io("http://localhost:8000", {
    autoConnect: false,
    path: "/api/message",
    extraHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return socket;
};
