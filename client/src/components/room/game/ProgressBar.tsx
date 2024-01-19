import { CropSquare, SquareRounded } from "@mui/icons-material";

interface ProgressBarProps {
    progress: number;
    outOf: number;
}

export default function ProgressBar({ progress, outOf }: ProgressBarProps) {

    const progressArray = new Array(outOf).fill(null);

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            { progressArray.map((_, i) => {
                return (
                    <>
                        { i < progress ? <SquareRounded fontSize='medium' color='success' /> : <CropSquare /> }
                    </>
                );
            })}
        </div>
    );
}