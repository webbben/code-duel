import React, { useEffect, useState } from "react";
import GameSettings from "./GameSettings";
import RoomMembers from "./RoomMembers";
import ChatPane from "./ChatPane";
import { Alert, Snackbar } from "@mui/material";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { RoomMessage, RoomUpdateTypes, useWebSocket } from "../WebSocketContext";
import { Link } from "react-router-dom";
import { routes } from "../../router/router";
import Game from "./game/Game";
import { launchGame } from "../../dataProvider";
import { Room } from "../../dataModels";

interface RoomContentProps {
    roomData: Room
}

export default function RoomContent(props: RoomContentProps) {

    const roomData = props.roomData;
    const username = useAppSelector((state: RootState) => state.userInfo.username);
    const loggedIn = useAppSelector((state: RootState) => state.userInfo.loggedIn);
    const idToken = useAppSelector((state: RootState) => state.userInfo.idToken);

    // we handle updating the room data in kind of an odd way:
    // roomData is initialized when the client loads a room's url, using react-router's loader functionality
    // then, when updates come in through websocket, we manually change roomData
    // since roomData isn't a state variable, we also keep this timestamp state variable.
    // it serves to both log the latest websocket update, but crucially also trigger a rerender.
    const [updateTimestamp, setUpdateTimestamp] = useState('');

    const { handleRoomMessage } = useWebSocket();

    async function handleLaunchGame(problemID: string) {
        if (!loggedIn || !idToken || !roomData.id) return;
        if (problemID === "") {
            return;
        }
        const success = await launchGame(roomData.id, problemID, idToken);
        if (!success) {
            //TODO show feedback to user
            return;
        }
        console.log("launching game...");
    }

    function updateRoomInfo(roomMsg: RoomMessage) {
        if (!roomData) {
            return;
        }
        const timestamp = new Date(roomMsg.timestamp).toLocaleTimeString();
        const roomUpdate = roomMsg.roomupdate;
        const type = roomUpdate.type;

        switch (type) {
            case RoomUpdateTypes.changeRoomName:
                roomData.Title = roomUpdate.data.value;
                console.log(`room name set to ${roomUpdate.data.value}.`);
                // TODO - keep this or discard? not sure if we will allow renaming existing rooms
                break;
            case RoomUpdateTypes.changeDifficulty:
                roomData.Difficulty = roomUpdate.data.value;
                console.log(`room difficulty set to ${roomUpdate.data.value}.`);
                break;
            case RoomUpdateTypes.userJoin:
                if (!roomData.Users) {
                    console.warn("room has no user list?");
                    return;
                }
                if (roomData.Users.includes(roomUpdate.data.value)) break;
                roomData.Users.push(roomUpdate.data.value);
                console.log(`user ${roomUpdate.data.value} has joined the room.`);
                break;
            case RoomUpdateTypes.userLeave:
                if (!roomData.Users) {
                    console.warn("room has no user list?");
                    return;
                }
                if (!roomData.Users.includes(roomUpdate.data.value)) break;
                roomData.Users = roomData.Users.filter((user) => user != roomUpdate.data.value);
                console.log(`user ${roomUpdate.data.value} has left the room.`);
                break;
            case RoomUpdateTypes.setUserReady:
                console.log(`user is now ready`);
                // TODO
                break;
            case RoomUpdateTypes.launchGame:
                console.log("launching game!");
                roomData.InGame = true;
                break;
        }
        setUpdateTimestamp(timestamp);
    }
    
    useEffect(() => {
        const unsubRoomMessages = handleRoomMessage((incomingMessage: RoomMessage) => {
            console.log("received room update");
            console.log(incomingMessage);
            updateRoomInfo(incomingMessage);
        });

        return () => {
            unsubRoomMessages();
        };
    }, []);

    console.log(`last room update: ${updateTimestamp}`);

    // split off to a new view while in-game
    // decided to keep this same RoomContent component mounted rather than routing to a new path
    // so we can keep the existing websocket connection and message handling, rather than having to write a new
    // version of it just for in-game events.
    if (roomData.InGame) {
        return (
            <Game roomData={roomData} token={idToken || ""} username={username || ""} />
        );
    }

    return (
        <div style={{padding: '20px', height: '100%', display: 'flex', flexDirection: 'row'}}>
            <div className="room_pane">
                <GameSettings
                isOwner={username === roomData.Owner}
                launchGameCallback={handleLaunchGame}
                title={roomData.Title}
                difficulty={roomData.Difficulty}
                updateSettings={() => console.log('hi')} />
                <RoomMembers
                roomID={roomData.id}
                idToken={idToken}
                users={roomData.Users}
                owner={roomData.Owner}
                maxCapacity={roomData.MaxCapacity} />
            </div>
            <div className="room_pane">
                <ChatPane username={username} />
            </div>
            <Snackbar open={!loggedIn} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert variant='filled' severity="warning">You're currently not logged in, so you won't be able to participate in this room. <Link to={routes.login}>Login here :)</Link></Alert>
            </Snackbar>
        </div>
    )
}