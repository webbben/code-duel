import React, { ReactNode, createContext, useContext, useEffect, useRef } from "react";
import { useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";

interface WebSocketProviderProps {
    children: ReactNode;
    roomID: string;
}
interface WebSocketContextType {
    sendMessage: (message: string, sender: string) => void;
    handleMessage: (callback: (incomingMessage: Message) => void) => () => void;
}
export interface Message {
    sender: string,
    content: string,
    timestamp: number
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

/**
 * Gives access to a websocket connection for a room to descendents via the useWebSocket hook
 */
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, roomID }) => {

    const ws = useRef<WebSocket | null>(null);
    const loggedIn = useAppSelector((state: RootState) => state.userInfo.loggedIn);

    useEffect(() => {
        if (!loggedIn) {
            console.warn('user not logged in; aborting websocket connection');
            return;
        }
        ws.current = new WebSocket(`ws://localhost:8080/ws?room=${roomID}`);

        ws.current.onopen = () => {
            console.log('WebSocket connection opened');
        };

        ws.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [loggedIn]);

    /* handles sending a message over websocket to other users in the same room */
    const sendMessage = (msg: string, sender: string) => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket connection not open. Message not sent.');
            return;
        }
        if (msg.trim() === '' || !sender || sender === "") {
            console.warn("couldn't send message due to insufficient information")
            return;
        }
        const timestamp = Date.now();
        const message = {
            type: "message",
            content: msg,
            room: roomID,
            sender: sender,
            timestamp: timestamp
        }
        ws.current.send(JSON.stringify(message));
        console.log("sent message", message);
    };

    /**
     * function for subscribing and setting the callback behavior for when messages are received over websocket. returns the unsubscribe function, for cleanup.
     * @param callback a callback function for handling when messages are received over websocket. probably for updating state in the consuming component.
     * @returns an unsubscribe function to stop listening for messages; call this function when the component unmounts to prevent memory leaks.
     */
    const handleMessage = (callback: (incomingMessage: Message) => void) => {
        const listener = (event: MessageEvent) => {
            const receivedMessage = JSON.parse(event.data);
            const chatMsg: Message = {
                sender: receivedMessage.sender,
                content: receivedMessage.content,
                timestamp: receivedMessage.timestamp
            };
            console.log('Received message:', receivedMessage, chatMsg);
            callback(chatMsg);
        };
    
        ws.current?.addEventListener('message', listener);
    
        // Return a cleanup function to unsubscribe when needed
        return () => {
            ws.current?.removeEventListener('message', listener);
        };
    };

    const contextValue: WebSocketContextType = {
        sendMessage,
        handleMessage,
    };

    return (
        <WebSocketContext.Provider value={contextValue}>
            { children } 
        </WebSocketContext.Provider>
    );
}

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
  };