// Clock.js
import React, { useEffect, useState } from "react";
import "./Clock.css";

function Clock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(intervalId);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="clock-container">
            <div className="clock-time">{formatTime(time)}</div>
            <div className="clock-date">{formatDate(time)}</div>
        </div>
    );
}

export default Clock;
