import { Typography } from "@mui/material";
import { UserProgress } from "./Game";
import ProgressBar from "./ProgressBar";

interface PlayerInfoProps {
    users: string[];
    progressMap: UserProgress;
    caseCount: number;
}

export default function PlayerInfo({ users, progressMap, caseCount }: PlayerInfoProps) {

    return (
        <div className="game_section" style={{ flex: "0 1 auto" }}>
            <Typography>Player Info</Typography>
            {users?.map((user: string) => {

                return (
                    <div style={{ display: 'flex' }}>
                        <Typography
                            key={user}
                        >{user}</Typography>
                        <ProgressBar progress={progressMap[user]} outOf={caseCount} />
                    </div>
                );
            })}
        </div>
    )
}