import { Grid, Typography } from "@mui/material";
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
            <Typography variant="h6" textAlign={'left'}>Player Info</Typography>
            <Grid container>
                {users?.map((user: string) => {

                    return (
                        <>
                            <Grid item xs={2}>
                                <Typography textAlign={'left'}
                                    key={user}
                                >{user}</Typography>
                            </Grid>
                            <Grid item xs={10}>
                                <ProgressBar progress={progressMap[user]} outOf={caseCount} />
                            </Grid>
                        </>
                    );
                })}
            </Grid>
        </div>
    )
}