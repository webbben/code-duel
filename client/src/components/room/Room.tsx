import React from "react";
import { Params, useLoaderData } from "react-router-dom";
import { getRoomData } from "../../dataProvider";
import { WebSocketProvider } from "../WebSocketContext";
import RoomContent from "./RoomContent";
import { Room as RoomData } from "../../dataModels";

// 
// A wrapper for RoomContent, since we need to load WebSocketProvider before its hooks are able to be used.
//

export async function loader({ params }: { params: Params<"roomID"> }) {
    const roomID = params.roomID;
    if (!roomID) {
        console.error('no room ID found in URL params');
        return null;
    }
    const roomData = await getRoomData(roomID);
    if (!roomData) return null;
    roomData.id = roomID;
    return roomData;
}

export default function Room() {
    const roomData = useLoaderData() as RoomData;

    if (!roomData) {
        return null;
    }

    return (
        <WebSocketProvider roomID={roomData.id}>
            <RoomContent roomData={roomData} />
        </WebSocketProvider>
    );
}