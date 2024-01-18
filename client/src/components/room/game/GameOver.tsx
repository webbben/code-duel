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

interface GameOverProps {
    winner: string;
    users: string[];
    progress: UserProgress;
}

export default function GameOver({ winner, users, progress }: GameOverProps) {
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
                        <div style={{ textAlign: "left" }}>
                            {users.map((user: string) => {
                                return (
                                    <Typography
                                        key={user}
                                    >{`${user} | progress: ${progress[user]}`}</Typography>
                                );
                            })}
                        </div>
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
