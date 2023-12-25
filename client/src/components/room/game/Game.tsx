import { Editor } from "@monaco-editor/react";
import { Divider, IconButton, MenuItem, Select, Typography } from "@mui/material";
import '../../../styles/Room.css';
import '../../../styles/Game.css';
import { useEffect, useState } from "react";
import { PlayArrow } from "@mui/icons-material";
import ProblemDetails from "./ProblemDetails";
import { RoomMessage, useWebSocket } from "../../WebSocketContext";
import { loadGameRoom, loadProblemTemplate, testCode } from "../../../dataProvider";
import { Problem, Room } from "../../../dataModels";

const langMapEditor: { [id: string]: string } = {
    "py": "python",
    "go": "go",
    "sh": "shell"
};

const langMapServer: { [id: string]: string } = {
    "py": "python",
    "go": "go",
    "sh": "bash"
};

const defaultLang = "py";

interface GameProps {
    roomData: Room
    token: string
    username: string
}

interface UserProgress {
    [username: string]: number;
}

export default function Game(props: GameProps) {

    const [lang, setLang] = useState(defaultLang);
    const [code, setCode] = useState<string>("");
    const [problem, setProblem] = useState<Problem | null>(null);

    // define the problem ID here since there are technically two places the problem ID could be retrieved from
    // TODO redo logic on getting problem/problem ID for room?
    const problemID: string = problem ? problem.id : (props.roomData ? props.roomData.Problem : "");
    if (problemID === "") {
        console.warn("no problem ID found for game!");
    }
    if (problem && props.roomData) {
        if (problem.id !== props.roomData.Problem) {
            console.warn("problem ID on problem object doesn't match problem ID on room object?", `problem obj: ${problem.id}`, `room obj: ${props.roomData.Problem}`);
        }
    }

    const [userProgress, setUserProgress] = useState<UserProgress>(() => {
        // initialize all scores to zero
        const initialScores: UserProgress = {};
        props.roomData?.Users?.forEach((username) => {
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

    async function runTestCases() {
        if (code === "") {
            console.warn("there's no code to test");
            return;
        }
        const testResults = await testCode(code, langMapServer[lang], problemID, props.token, props.roomData.id, true);
        console.log("test results: ", testResults);
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

    async function loadProblem() {
        const problemData = await loadGameRoom(props.roomData.id, props.token);
        console.log("game problem: ", problemData);
        setProblem(problemData);
    }

    async function loadCodeTemplate() {
        const template = await loadProblemTemplate(problemID, lang);
        setCode(template || "");
    }

    // handle first time loading actions
    useEffect(() => {
        // sub to game messages
        const unsubRoomMessages = handleGameMessage((incomingMessage: RoomMessage) => {
            console.log("received game update");
            console.log(incomingMessage);
            updateGameInfo(incomingMessage);
        });

        // load data for game
        loadProblem();
        loadCodeTemplate();

        return () => {
            unsubRoomMessages();
        };
    }, []);

    // reload code template if language changes
    useEffect(() => {
        loadCodeTemplate();
    }, [lang]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'row', backgroundColor: 'black', paddingRight: '10px', paddingBottom: '10px'}}>
            <div className="room_pane">
                <ProblemDetails problem={problem} />
                <div className="game_section" style={{ flex: '0 1 auto'}}>
                    <Typography>Player Info</Typography>
                    { props.roomData?.Users?.map((user: string) => {
                        return (
                            <Typography>{`${user} | progress: ${userProgress[user]}`}</Typography>
                        )
                    })}
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
                    language={langMapEditor[lang]} 
                    value={code} 
                    onChange={(s, _ev) => handleChangeCode(s)}
                    theme='vs-dark' />
                    </div>
                </div>
                <div className="game_section" style={{ flex: '0 1 auto'}}>
                    <Typography>Test results</Typography>
                    <IconButton onClick={() => runTestCases()}>
                        <PlayArrow />
                    </IconButton>
                </div>
            </div>
        </div>
    );
}