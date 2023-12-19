import { Editor } from "@monaco-editor/react";
import { Divider, MenuItem, Select, Typography } from "@mui/material";
import '../../styles/Room.css';
import '../../styles/Game.css';
import { useState } from "react";

const langMap: { [id: string]: string } = {
    "py": "python",
    "go": "go",
    "sh": "bash"
}

export default function Game() {

    const [lang, setLang] = useState("py");

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'row', backgroundColor: 'black', paddingRight: '10px', paddingBottom: '10px'}}>
            <div className="room_pane">
                <div className="game_section" style={{ flex: '1 1 auto', minHeight: '60%'}}>
                    <Typography>Problem Deets</Typography>
                </div>
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
                    <Editor height={'100%'} language={langMap[lang]} defaultValue="# write your code here" theme='vs-dark' />
                    </div>
                </div>
                <div className="game_section" style={{ flex: '0 1 auto'}}>
                    <Typography>Test results</Typography>
                </div>
            </div>
        </div>
    );
}