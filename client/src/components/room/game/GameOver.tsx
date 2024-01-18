import { Backdrop, Card, CardContent, Slide, Typography } from "@mui/material";

interface GameOverProps {
    winner: string;
}

export default function GameOver({ winner }: GameOverProps) {
    let winnerText = "Ended in a tie.";
    if (winner !== "") {
        winnerText = `Winner: ${winner}!`;
    }
    return (
        <Backdrop open>
            <Slide in>
                <Card>
                    <CardContent>
                        <Typography variant="h5">Game Over!</Typography>
                        <Typography variant="h6">{winnerText}</Typography>
                    </CardContent>
                </Card>
            </Slide>
        </Backdrop>
    );
}
