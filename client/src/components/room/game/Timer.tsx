import { TimerOutlined } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

interface TimerProps {
    initialMinutes: number;
    active: boolean;
}

export default function Timer({ initialMinutes, active }: TimerProps) {
    const [minutes, setMinutes] = useState<number>(initialMinutes);
    const [seconds, setSeconds] = useState<number>(0);
    const minRef = useRef(initialMinutes);
    const secRef = useRef(0);

    const color = minutes === 0 && seconds <= 30 ? "orangered" : "unset";

    useEffect(() => {
        if (!active) return;
        const timer = setInterval(() => {
            if (secRef.current > 0) {
                setSeconds(secRef.current - 1);
                secRef.current--;
                return;
            }
            if (minRef.current > 0) {
                setMinutes(minRef.current - 1);
                minRef.current--;
                setSeconds(59);
                secRef.current = 59;
                return;
            }
            clearInterval(timer);
        }, 1000);
        return () => clearInterval(timer);
    }, [active]);

    const displaySeconds = seconds < 10 ? `0${seconds}` : seconds;

    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            <TimerOutlined />
            <Typography
                color={color}
            >{`${minutes}:${displaySeconds}`}</Typography>
        </div>
    );
}
