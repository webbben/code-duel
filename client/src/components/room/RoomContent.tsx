import React, { useEffect, useState } from "react";
import GameSettings from "./GameSettings";
import RoomMembers from "./RoomMembers";
import ChatPane from "./ChatPane";
import { Alert, Snackbar } from "@mui/material";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import {
    RoomMessage,
    RoomUpdate,
    RoomUpdateTypes,
    useWebSocket,
} from "../WebSocketContext";
import { Link } from "react-router-dom";
import { routes } from "../../router/router";
import Game from "./game/Game";
import { getProblemList, launchGame } from "../../dataProvider";
import { Room } from "../../dataModels";

interface RoomContentProps {
    roomData: Room;
}

export interface ProblemOverview {
    name: string;
    id: string;
    difficulty: number;
    quickDesc: string;
}

export default function RoomContent(props: RoomContentProps) {
    const roomData = props.roomData;
    const username = useAppSelector(
        (state: RootState) => state.userInfo.username
    );
    const loggedIn = useAppSelector(
        (state: RootState) => state.userInfo.loggedIn
    );
    const idToken = useAppSelector(
        (state: RootState) => state.userInfo.idToken
    );

    // we handle updating the room data in kind of an odd way:
    // roomData is loaded from the database in the wrapper component and passed in here as a prop
    // instead of making state variables for all the different properties of roomData, we are just
    // updating that object directly
    // then, sort of hacky, but triggering a re-render by changing this last update timestamp state variable.
    const [updateTimestamp, setUpdateTimestamp] = useState("");

    const [problemOverview, setProblemOverview] = useState<ProblemOverview>();
    const [problemList, setProblemList] = useState<ProblemOverview[]>([]);

    const { handleRoomMessage, connectionOpen, sendRoomMessage } =
        useWebSocket();

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

    function handleUpdateRoomSettings(setting: string, value: any) {
        switch (setting) {
            case "difficulty":
                roomData.Difficulty = value;
                break;
            case "timeLimit":
                roomData.TimeLimit = value;
                break;
            case "randomProblem":
                roomData.RandomProblem = value;
                break;
        }
        const today = new Date();
        setUpdateTimestamp(today.toLocaleTimeString());
    }

    function sendRoomUpdate(updateType: string, updateValue: any) {
        const roomUpdate: RoomUpdate = {
            type: updateType,
            data: {
                value: updateValue,
            },
        };
        sendRoomMessage(roomUpdate);
    }

    function updateRoomInfo(roomMsg: RoomMessage) {
        if (!roomData) {
            return;
        }
        const timestamp = new Date(roomMsg.timestamp).toLocaleTimeString();
        const roomUpdate = roomMsg.roomupdate;
        const type = roomUpdate.type;

        switch (type) {
            case RoomUpdateTypes.changeDifficulty:
                roomData.Difficulty = roomUpdate.data.value;
                console.log(`room difficulty set to ${roomUpdate.data.value}.`);
                break;
            case RoomUpdateTypes.changeTimeLimit:
                roomData.TimeLimit = roomUpdate.data.value;
                break;
            case RoomUpdateTypes.userJoin:
                if (!roomData.Users) {
                    roomData.Users = [];
                }
                if (roomData.Users.includes(roomUpdate.data.value)) break;
                roomData.Users.push(roomUpdate.data.value);
                console.log(
                    `user ${roomUpdate.data.value} has joined the room.`
                );
                break;
            case RoomUpdateTypes.userLeave:
                if (!roomData.Users) {
                    console.warn("room has no user list?");
                    return;
                }
                if (!roomData.Users.includes(roomUpdate.data.value)) break;
                roomData.Users = roomData.Users.filter(
                    (user) => user !== roomUpdate.data.value
                );
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
            case RoomUpdateTypes.changeProblem:
                console.log("changing problem");
                const problemOverview = roomUpdate.data
                    .value as ProblemOverview;
                roomData.Problem = problemOverview?.id || "";
                setProblemOverview(problemOverview);
                break;
            case RoomUpdateTypes.randomProblem:
                roomData.RandomProblem = roomUpdate.data.value;
                break;
        }
        setUpdateTimestamp(timestamp);
    }

    // load problems
    useEffect(() => {
        const loadProblems = async () => {
            const loadedProblems: ProblemOverview[] = await getProblemList();
            setProblemList(loadedProblems);
            // set the problem too if it's not set yet and we know the problem ID
            if (!problemOverview && props.roomData?.Problem !== "") {
                setProblemOverview(
                    loadedProblems.find(
                        (prob) => prob.id === props.roomData.Problem
                    )
                );
            }
        };
        loadProblems();
    }, []);

    // handle websocket connection
    useEffect(() => {
        if (!connectionOpen) return;
        const unsubRoomMessages = handleRoomMessage(
            (incomingMessage: RoomMessage) => {
                updateRoomInfo(incomingMessage);
            }
        );

        return () => {
            unsubRoomMessages();
        };
    }, [connectionOpen]);

    console.log(`last room update: ${updateTimestamp}`);

    // split off to a new view while in-game
    // decided to keep this same RoomContent component mounted rather than routing to a new path
    // so we can keep the existing websocket connection and message handling, rather than having to write a new
    // version of it just for in-game events.
    if (roomData.InGame) {
        return (
            <Game
                roomData={roomData}
                token={idToken || ""}
                username={username || ""}
            />
        );
    }

    return (
        <div
            style={{
                padding: "20px",
                height: "100%",
                display: "flex",
                flexDirection: "row",
            }}
        >
            <div className="room_pane">
                <GameSettings
                    timeLimit={roomData.TimeLimit}
                    updateSetting={handleUpdateRoomSettings}
                    problem={problemOverview}
                    setProblem={setProblemOverview}
                    randomProblem={roomData.RandomProblem}
                    problemList={problemList}
                    isOwner={username === roomData.Owner}
                    launchGameCallback={handleLaunchGame}
                    sendRoomUpdate={sendRoomUpdate}
                    title={roomData.Title}
                    difficulty={roomData.Difficulty}
                />
                <RoomMembers
                    roomID={roomData.id}
                    idToken={idToken}
                    users={roomData.Users}
                    owner={roomData.Owner}
                    maxCapacity={roomData.MaxCapacity}
                />
            </div>
            <div className="room_pane">
                <ChatPane username={username} />
            </div>
            <Snackbar
                open={!loggedIn}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert variant="filled" severity="warning">
                    You're currently not logged in, so you won't be able to
                    participate in this room.{" "}
                    <Link to={routes.login}>Login here :)</Link>
                </Alert>
            </Snackbar>
        </div>
    );
}
