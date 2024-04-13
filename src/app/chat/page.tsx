"use client";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { SocketConnection } from "../socket";
import { Chat } from "./chat";

const Page = () => {
  const { data: sessionData, status } = useSession();
  const [socket, setSocket] = useState<Socket>();
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    if (
      status === "authenticated" &&
      sessionData.accessToken &&
      sessionData.user.id
    ) {
      const socketWithToken = SocketConnection(
        sessionData.accessToken
      );
      setSocket(socketWithToken);
      setUserId(sessionData.user.id);
    }
  }, [
    status,
    sessionData?.accessToken,
    sessionData?.user.id,
  ]);

  if (status === "loading") {
    return "Loading...";
  }

  if (!socket || !userId) {
    // TODO: make a fallback ui or loading state with info
    return null;
  }

  return <Chat socket={socket} userId={userId} />;
};

export default Page;
