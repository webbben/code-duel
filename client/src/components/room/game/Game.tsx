import { Editor } from "@monaco-editor/react";
import { Divider, IconButton, MenuItem, Select, Typography } from "@mui/material";
import '../../../styles/Room.css';
import '../../../styles/Game.css';
import { useEffect, useState } from "react";
import { PlayArrow } from "@mui/icons-material";
import { Params, useLoaderData } from "react-router-dom";
import { getRoomData } from "../../../dataProvider";
import { RoomData } from "../../lobby/Lobby";
import ProblemDetails from "./ProblemDetails";
import { RoomMessage, useWebSocket } from "../../WebSocketContext";

export async function loader({ params }: { params: Params<"roomID"> }) {
    const roomID = params.roomID;
    if (!roomID) {
        console.error('no room ID found in URL params');
        return null;
    }
    const roomData = await getRoomData(roomID);
    roomData.id = roomID;
    return roomData;
}

const langMap: { [id: string]: string } = {
    "py": "python",
    "go": "go",
    "sh": "shell"
};

const defaultLang = "py";
const defaultPyCode = "# write code here";
const defaultBashCode = "# write code here";
const defaultGoCode = "package main\n\n// write code here\nfunc main() {\n}\n";

interface GameProps {
    roomData: RoomData
}

interface UserProgress {
    [username: string]: number;
}

export default function Game(props: GameProps) {

    const [lang, setLang] = useState(defaultLang);
    const [code, setCode] = useState<string>("");
    const [userProgress, setUserProgress] = useState<UserProgress>(() => {
        // initialize all scores to zero
        const initialScores: UserProgress = {};
        props.roomData.Users.forEach((username) => {
          initialScores[username] = 0;
        });
        return initialScores;
      });

    const { handleGameMessage } = useWebSocket();

    function updateUserProgress(username: string, progress: number) {
        if (!props.roomData.Users.includes(username)) {
            console.warn("update user progress: user isn't in this room...");
            return;
        }
        setUserProgress((prevScores) => ({
            ...prevScores,
            [username]: progress,
        }));
    }

    function handleChangeCode(codeString: string | undefined) {
        setCode(codeString || "");
    }

    function testCode() {
        if (code === "") {
            console.warn("there's no code to test");
            return;
        }

    }

    function updateGameInfo(msg: RoomMessage) {
        if (!msg.roomupdate || !msg.roomupdate.data) {
            return;
        }
        const roomUpdate = msg.roomupdate;

        // update for a user's progress
        if (roomUpdate.type == "CODE_SUBMIT_RESULT") {
            const user = roomUpdate.data.user;
            const progress = roomUpdate.data.value;
            updateUserProgress(user, progress);
        }
    }

    useEffect(() => {
        const unsubRoomMessages = handleGameMessage((incomingMessage: RoomMessage) => {
            console.log("received game update");
            console.log(incomingMessage);
            updateGameInfo(incomingMessage);
        });

        return () => {
            unsubRoomMessages();
        };
    }, []);

    useEffect(() => {
        if (lang === "py") {
            setCode(defaultPyCode);
        }
        if (lang === "go") {
            setCode(defaultGoCode);
        }
        if (lang === "sh") {
            setCode(defaultBashCode);
        }
    }, [lang]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'row', backgroundColor: 'black', paddingRight: '10px', paddingBottom: '10px'}}>
            <div className="room_pane">
                <ProblemDetails />
                <div className="game_section" style={{ flex: '0 1 auto'}}>
                    <Typography>Player Info</Typography>
                </div>
            </div>
            <div className="room_pane">
                <div className="game_section" style={{ flex: '1 1 auto', minHeight: '70%', display: 'flex', flexDirection: 'column'}}>
                    <div style={{ display: 'flex', alignItems: 'center'}}>
                        <Typography>solution.</Typography>
                        <Select 
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        variant='standard'
                        sx={{ color: 'green'}}>
                            <MenuItem value="py">py</MenuItem>
                            <MenuItem value="go">go</MenuItem>
                            <MenuItem value="sh">sh</MenuItem>
                        </Select>
                    </div>
                    <Divider />
                    <div style={{ flex: '1 1 auto'}}>
                    <Editor 
                    height={'100%'} 
                    language={langMap[lang]} 
                    value={code} 
                    onChange={(s, _ev) => handleChangeCode(s)}
                    theme='vs-dark' />
                    </div>
                </div>
                <div className="game_section" style={{ flex: '0 1 auto'}}>
                    <Typography>Test results</Typography>
                    <IconButton onClick={() => testCode()}>
                        <PlayArrow />
                    </IconButton>
                </div>
            </div>
        </div>
    );
}