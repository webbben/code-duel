import React, { ReactNode, createContext, useContext, useEffect, useRef } from "react";
import { useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";

interface WebSocketProviderProps {
    children: ReactNode;
    roomID: string;
}
interface WebSocketContextType {
    sendChatMessage: (message: string, sender: string) => void;
    handleChatMessage: (callback: (incomingMessage: ChatMessage) => void) => () => void;
    sendRoomMessage: (roomUpdate: RoomUpdate) => void;
    handleRoomMessage: (callback: (incomingMessage: RoomMessage) => void) => () => void;
    handleGameMessage: (callback: (incomingMessage: RoomMessage) => void) => () => void;
}
export interface ChatMessage {
    type: string,
    sender: string,
    content: string,
    timestamp: number
}

export interface RoomMessage {
    type: string,
    roomupdate: RoomUpdate
    timestamp: number
}

export type Message = RoomMessage | ChatMessage;

export interface RoomUpdate {
    type: string,
    /** data will always have a value property, and may have other properties if more context is needed */
    data: any
}

// room updates that can be broadcast to other clients in a room
export const RoomUpdateTypes = {
    changeRoomName: 'CHANGE_ROOM_NAME',
    changeDifficulty: 'CHANGE_DIFFICULTY',
    changeMode: 'CHANGE_MODE',
    changeTimeLimit: 'CHANGE_TIME_LIMIT',
    changeProblem: 'CHANGE_PROBLEM',
    setUserReady: 'SET_USER_READY',
    userLeave: 'USER_LEAVE',
    userJoin: 'USER_JOIN',
    launchGame: 'LAUNCH_GAME'
}

// the types of messages that can be broadcast to other clients in a room
export const messageTypes = {
    chatMessage: 'chat_message',
    roomMessage: 'room_message',
    gameMessage: 'game_message'
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

/**
 * Gives access to a websocket connection for a room to descendents via the useWebSocket hook
 */
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, roomID }) => {

    const ws = useRef<WebSocket | null>(null);
    const messageQueue = useRef<Message[]>([]); // enqueue messages if they are unable to be sent
    const loggedIn = useAppSelector((state: RootState) => state.userInfo.loggedIn);
    const idToken = useAppSelector((state: RootState) => state.userInfo.idToken);

    useEffect(() => {
        if (!loggedIn) {
            console.warn('user not logged in; aborting websocket connection');
            return;
        }
        ws.current = new WebSocket(`ws://localhost:8080/ws?room=${roomID}`);

        ws.current.addEventListener('open', (event) => {
            console.log('WebSocket connection opened');
            // send auth info
            if (idToken) {
                const message: Message = {
                    type: "authorization",
                    content: idToken,
                    sender: "websocket",
                    timestamp: Date.now()
                }
                sendWebsocketMessage(message);
            }
            // check for queued messages
            if (messageQueue.current?.length > 0) {
                sendQueuedMessages();
            }
        });

        ws.current.addEventListener('message', (event) => {
            console.log("received message over websocket", event.data);
        });

        ws.current.addEventListener('close', (event) => {
            console.log('WebSocket connection closed');
        });

        ws.current.addEventListener('error', (error) => {
            console.log('WebSocket error', error);
        });

        return () => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
        };
    }, []);

    /* handles sending a chat message over websocket to other users in the same room */
    const sendChatMessage = (msg: string, sender: string) => {
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
            type: messageTypes.chatMessage,
            room: roomID,
            content: msg,
            sender: sender,
            timestamp: timestamp
        };
        ws.current.send(JSON.stringify(message));
        console.log("sent message", message);
    };

    /* handles sending a room message over websocket to other users in the same room */
    const sendRoomMessage = (roomUpdate: RoomUpdate) => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket connection not open. Message not sent.');
            return;
        }
        if (!roomUpdate || !roomUpdate.data || !roomUpdate.type) {
            console.warn("couldn't send message due to insufficient information")
            return;
        }
        const timestamp = Date.now();
        const message = {
            type: messageTypes.roomMessage,
            room: roomID,
            timestamp: timestamp,
            roomUpdate: roomUpdate
        };
        ws.current.send(JSON.stringify(message));
        console.log("sent message", message);
    };

    const sendWebsocketMessage = (msg: Message) => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
            enqueueMessage(msg);
            return;
        }
        ws.current.send(JSON.stringify(msg));
        return;
    }

    const enqueueMessage = (msg: Message) => {
        if (!messageQueue.current) {
            messageQueue.current = [];
        }
        messageQueue.current.push(msg);
    }

    const sendQueuedMessages = () => {
        if (!messageQueue.current || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
            return;
        }
        const messages = [...messageQueue.current];
        messageQueue.current = [];
        for (const msg of messages) {
            sendWebsocketMessage(msg);
        }
    }

    /**
     * function for subscribing and setting the callback behavior for when chat messages are received over websocket. returns the unsubscribe function, for cleanup.
     * @param callback a callback function for handling when messages are received over websocket. probably for updating state in the consuming component.
     * @returns an unsubscribe function to stop listening for messages; call this function when the component unmounts to prevent memory leaks.
     */
    const handleChatMessage = (callback: (incomingMessage: ChatMessage) => void) => {
        const listener = (event: MessageEvent) => {
            const receivedMessage = JSON.parse(event.data);
            console.log("incoming message", receivedMessage);
            if (receivedMessage.type !== "chat_message") {
                return;
            }
            const msg: ChatMessage = {
                type: receivedMessage.type,
                sender: receivedMessage.sender,
                content: receivedMessage.content,
                timestamp: receivedMessage.timestamp
            };
            console.log('Received chat message:', receivedMessage, msg);
            callback(msg);
        };

        if (!ws.current) {
            console.warn("failed to add websocket listener for chat");
        }
        else {
            ws.current.addEventListener('message', listener);
            console.log("listening for chat messages over websocket");
        }
    
        // Return a cleanup function to unsubscribe when needed
        return () => {
            ws.current?.removeEventListener('message', listener);
        };
    };

    const handleRoomMessage = (callback: (incomingMessage: RoomMessage) => void) => {
        const listener = (event: MessageEvent) => {
            const receivedMessage = JSON.parse(event.data);
            console.log("incoming message", receivedMessage);
            if (receivedMessage.type !== "room_message") {
                return;
            }
            const msg: RoomMessage = {
                type: receivedMessage.type,
                timestamp: receivedMessage.timestamp,
                roomupdate: receivedMessage.roomupdate
            };
            console.log('Received room message:', receivedMessage, msg);
            callback(msg);
        };
    
        if (!ws.current) {
            console.warn("failed to add websocket listener for room messages");
        }
        else {
            ws.current.addEventListener('message', listener);
            console.log("listening for room messages over websocket");
        }
    
        // Return a cleanup function to unsubscribe when needed
        return () => {
            ws.current?.removeEventListener('message', listener);
        };
    };

    const handleGameMessage = (callback: (incomingMessage: RoomMessage) => void) => {
        const listener = (event: MessageEvent) => {
            const receivedMessage = JSON.parse(event.data);
            console.log("incoming message", receivedMessage);
            if (receivedMessage.type !== messageTypes.gameMessage) {
                return;
            }
            const msg: RoomMessage = {
                type: receivedMessage.type,
                timestamp: receivedMessage.timestamp,
                roomupdate: receivedMessage.roomupdate
            };
            console.log('Received game message:', receivedMessage, msg);
            callback(msg);
        };
    
        if (!ws.current) {
            console.warn("failed to add websocket listener for game messages");
        }
        else {
            ws.current.addEventListener('message', listener);
            console.log("listening for game messages over websocket");
        }
    
        // Return a cleanup function to unsubscribe when needed
        return () => {
            ws.current?.removeEventListener('message', listener);
        };
    };

    const contextValue: WebSocketContextType = {
        sendChatMessage,
        handleChatMessage,
        sendRoomMessage,
        handleRoomMessage,
        handleGameMessage
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