import { Editor } from "@monaco-editor/react";
import { Divider, MenuItem, Select, Typography } from "@mui/material";
import "../../../styles/Room.css";
import "../../../styles/Game.css";
import { useEffect, useState } from "react";
import ProblemDetails from "./ProblemDetails";
import { RoomMessage, useWebSocket } from "../../WebSocketContext";
import {
    codeExecResponse,
    loadGameRoom,
    loadProblemTemplate,
    testCode,
} from "../../../dataProvider";
import { Problem, Room } from "../../../dataModels";
import TestResults from "./TestResults";
import GameOver from "./GameOver";
import PlayerInfo from "./PlayerInfo";

const langMapEditor: { [id: string]: string } = {
    py: "python",
    go: "go",
    sh: "shell",
};

const langMapServer: { [id: string]: string } = {
    py: "python",
    go: "go",
    sh: "bash",
};

const defaultLang = "py";

interface GameProps {
    roomData: Room;
    token: string;
    username: string;
}

export interface UserProgress {
    [username: string]: number;
}

export default function Game(props: GameProps) {
    const [lang, setLang] = useState(defaultLang);
    const [code, setCode] = useState<string>("");
    const [problem, setProblem] = useState<Problem | null>(null);
    const [lastTestResult, setLastTestResult] = useState<codeExecResponse>();
    const [gameOver, setGameOver] = useState({ gameOver: false, winner: "" });

    const [userProgress, setUserProgress] = useState<UserProgress>(() => {
        // initialize all scores to zero
        const initialScores: UserProgress = {};
        props.roomData?.Users?.forEach((username) => {
            initialScores[username] = 0;
        });
        return initialScores;
    });

    const { handleGameMessage, connectionOpen } = useWebSocket();

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
        if (gameOver.gameOver) return;
        setCode(codeString || "");
    }

    async function runTestCases() {
        if (gameOver.gameOver) return;
        if (code === "" || !problem || problem.id === "") {
            console.warn("there's no code to test");
            return;
        }
        const testResults = await testCode(
            code,
            langMapServer[lang],
            problem.id,
            props.token,
            props.roomData.id,
            true
        );
        if (testResults) {
            setLastTestResult(testResults);
        }
        console.log("test results: ", testResults);
    }

    function updateGameInfo(msg: RoomMessage) {
        if (!msg.roomupdate || !msg.roomupdate.data) {
            return;
        }
        const roomUpdate = msg.roomupdate;

        // game over
        if (roomUpdate.type === "GAME_OVER") {
            setGameOver({ gameOver: true, winner: roomUpdate.data.value });
            return;
        }

        // update for a user's progress
        if (roomUpdate.type === "CODE_SUBMIT_RESULT") {
            const user = roomUpdate.data.user;
            const progress = roomUpdate.data.value;
            updateUserProgress(user, progress);
        }
    }

    // handle subscribing to websocket game messages
    useEffect(() => {
        if (!connectionOpen) return;
        // sub to game messages
        const unsubRoomMessages = handleGameMessage(
            (incomingMessage: RoomMessage) => {
                console.log("received game update");
                console.log(incomingMessage);
                updateGameInfo(incomingMessage);
            }
        );

        return () => {
            unsubRoomMessages();
        };
    }, [connectionOpen]);

    // handle loading code template
    useEffect(() => {
        if (!lang || !problem || problem.id === "") return;
        console.log("useEffect: load code template");

        async function loadCodeTemplate() {
            if (!problem) return;
            console.log("loading code template");
            const template = await loadProblemTemplate(problem.id, lang);
            setCode(template || "");
        }
        loadCodeTemplate();
    }, [lang, problem]);

    // load game room data
    useEffect(() => {
        console.log("useEffect: load problem");
        async function loadProblem() {
            console.log("loading game room");
            const problemData = await loadGameRoom(
                props.roomData.id,
                props.token
            );
            setProblem(problemData);
        }
        loadProblem();
    }, []);

    return (
        <div
            style={{
                height: "100%",
                display: "flex",
                flexDirection: "row",
                backgroundColor: "black",
                paddingRight: "10px",
                paddingBottom: "10px",
            }}
        >
            <div className="room_pane">
                <ProblemDetails
                    problem={problem}
                    timeLimit={props.roomData.TimeLimit}
                />
                <PlayerInfo users={props.roomData?.Users} progressMap={userProgress} caseCount={problem?.caseCount || 0} />
            </div>
            <div className="room_pane">
                <div
                    className="game_section"
                    style={{
                        flex: "1 1 auto",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Typography>solution.</Typography>
                        <Select
                            value={lang}
                            onChange={(e) => setLang(e.target.value)}
                            variant="standard"
                            sx={{ color: "green" }}
                        >
                            <MenuItem value="py">py</MenuItem>
                            <MenuItem value="go">go</MenuItem>
                            <MenuItem value="sh">sh</MenuItem>
                        </Select>
                    </div>
                    <Divider />
                    <div style={{ flex: "1 1 auto" }}>
                        <Editor
                            height={"100%"}
                            language={langMapEditor[lang]}
                            value={code}
                            onChange={(s, _ev) => handleChangeCode(s)}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                            }}
                        />
                    </div>
                </div>
                <TestResults
                    runTestsCallback={runTestCases}
                    codeExecResult={lastTestResult}
                    testCases={problem?.testCases}
                />
            </div>
            {gameOver.gameOver && (
                <GameOver
                    winner={gameOver.winner}
                    users={props.roomData.Users}
                    progress={userProgress}
                    caseCount={problem?.caseCount || 0}
                />
            )}
        </div>
    );
}
