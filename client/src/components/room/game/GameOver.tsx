import {
    Backdrop,
    Button,
    Card,
    CardActions,
    CardContent,
    Fade,
    Typography,
} from "@mui/material";
import { UserProgress } from "./Game";
import { useNavigate } from "react-router-dom";
import PlayerInfo from "./PlayerInfo";

interface GameOverProps {
    winner: string;
    users: string[];
    progress: UserProgress;
    caseCount: number;
}

export default function GameOver({ winner, users, progress, caseCount }: GameOverProps) {
    const navigate = useNavigate();

    let winnerText = "Ended in a tie.";
    if (winner !== "") {
        winnerText = `Winner: ${winner}!`;
    }

    return (
        <Backdrop open>
            <Fade in timeout={3000}>
                <Card sx={{ width: "40%" }}>
                    <CardContent>
                        <Typography variant="h5">Game Over!</Typography>
                        <Typography gutterBottom variant="h6">
                            {winnerText}
                        </Typography>
                        <PlayerInfo users={users} progressMap={progress} caseCount={caseCount} />
                    </CardContent>
                    <CardActions>
                        <Button onClick={() => navigate("/")}>
                            Return to home
                        </Button>
                    </CardActions>
                </Card>
            </Fade>
        </Backdrop>
    );
}
