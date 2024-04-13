import { cloneDeep } from "lodash";
import React, {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { Socket } from "socket.io-client";

type User = {
  id: string;
  email: string;
  name: string;
  password?: string;
};

type Message = {
  id: string;
  message: string;
  createdAt: Date;
  user: User;
};

export const Chat = ({
  socket,
  userId,
}: {
  socket: Socket;
  userId: string;
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [typingDisplay, setTypingDisplay] = useState("");

  useEffect(() => {
    socket.connect();
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.emit("findAllMessages", {}, (res: Message[]) => {
      setMessages(res);
    });

    socket.on("message", (message) => {
      setMessages((prevMessages) => {
        const newMessages = cloneDeep(prevMessages);
        return [...newMessages, message];
      });
    });

    socket.on(
      "typing",
      ({
        user,
        isTyping,
      }: {
        user: any;
        isTyping: boolean;
      }) => {
        if (isTyping) {
          setTypingDisplay(`${user.name} is typing...`);
        } else {
          setTypingDisplay("");
        }
      }
    );

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  const sendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket?.emit("createMessage", {
      message: messageText,
    });
  };

  let timeout;
  const emitTyping = () => {
    socket?.emit("typing", { isTyping: true });
    timeout = setTimeout(() => {
      socket?.emit("typing", { isTyping: false });
    }, 1500);
  };

  return (
    <div>
      <div className="p-4">
        <p className="text-lg">
          Status:{" "}
          {isConnected ? "connected" : "disconnected"}
        </p>
        <p className="text-lg">Transport: {transport}</p>
      </div>

      <div className="flex mt-5">
        <div className="w-full p-4">
          <p>Current Id : {userId}</p>
        </div>
        <div className="w-full">
          {messages.map((data, index) => {
            return (
              <p key={index} className="text-lg">
                {/* @ts-ignore: Unreachable code error */}
                {data.user.name}: {data.message}
              </p>
            );
          })}
          <div>
            <p className="text-lg">{typingDisplay}</p>
            <form
              onSubmit={sendMessage}
              className="flex justify-center items-center"
            >
              <label htmlFor="message" className="text-lg">
                Message:
              </label>
              <input
                type="text"
                id="message"
                onChange={(e) => {
                  emitTyping();
                  setMessageText(e.target.value);
                }}
                className="border-2 border-rose-500 px-2 py-1 ml-2"
              />
              <button
                type="submit"
                className="bg-blue-500 px-4 py-2 ml-2 text-white rounded"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
