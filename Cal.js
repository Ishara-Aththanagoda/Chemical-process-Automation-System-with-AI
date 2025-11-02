// Cal.js
import React, { useState, useEffect } from "react";
import "./Cal.css";

const Cal = () => {
    const [input, setInput] = useState("");
    const [result, setResult] = useState("");

    const handleClick = (value) => {
        if (value === "C") {
            setInput("");
            setResult("");
        } else if (value === "←") {
            setInput((prev) => prev.slice(0, -1));
        } else if (value === "=") {
            try {
                const evalResult = eval(input.replace(/×/g, '*').replace(/÷/g, '/'));
                setResult(evalResult.toString());
            } catch {
                setResult("Error");
            }
        } else {
            setInput((prev) => prev + value);
        }
    };

    const handleKeyDown = (e) => {
        const keyMap = {
            Enter: "=",
            Backspace: "←",
            Escape: "C"
        };
        const value = keyMap[e.key] || e.key;
        const allowed = /^[0-9+\-*/.()÷×]$/.test(value) || ["=", "←", "C"].includes(value);
        if (allowed) {
            handleClick(value);
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const buttons = [
        "C", "←", "(", ")",
        "7", "8", "9", "÷",
        "4", "5", "6", "×",
        "1", "2", "3", "-",
        "0", ".", "=", "+"
    ];

    return (
        <div className="calculator-container">
            <div className="display">
                <div className="input">{input || "0"}</div>
                <div className="result">{result}</div>
            </div>
            <div className="buttons-grid">
                {buttons.map((btn, i) => (
                    <button key={i} onClick={() => handleClick(btn)} className="btn">
                        {btn}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Cal;
