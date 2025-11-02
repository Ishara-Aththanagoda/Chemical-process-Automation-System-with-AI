import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ladyFace from "./img_6.png"; // 🔄 Replace with your lady image
import "./Demo.css";

function Demo() {
    const [displayedText, setDisplayedText] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isTyping, setIsTyping] = useState(true);
    const navigate = useNavigate();
    const synthRef = useRef(window.speechSynthesis);
    const utteranceRef = useRef(null);

    const message = `Wishing you a truly meaningful and successful day,and I am CHEM Xpert as a unique invension and you are warmly  welcome to the Chemical Process Automation system at South Asia Textiles Limited.
    This advanced platform is designed to streamline every stage of your chemical processing workflow — from batch input and shift logging,
    to precision chemical dosing and automated reporting. With integrated voice control, real-time validations, and direct database connectivity,
    our system ensures efficiency, accuracy, and traceability in every process.
    Whether you're registering a new operation or reviewing past performance, you're now working with the future of textile chemical automation.`;

    useEffect(() => {
        const speak = () => {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = "en-US";
            utterance.pitch = 1;
            utterance.rate = 0.92;
            utterance.volume = 1;

            const voices = synthRef.current.getVoices();
            const femaleVoice = voices.find(v =>
                v.name.toLowerCase().includes("female") ||
                v.name.toLowerCase().includes("zira") ||
                v.name.toLowerCase().includes("google us english")
            );
            if (femaleVoice) utterance.voice = femaleVoice;

            utterance.onend = () => {
                setIsSpeaking(false);
            };

            synthRef.current.cancel();
            setIsSpeaking(true);
            synthRef.current.speak(utterance);
            utteranceRef.current = utterance;
        };

        const typeText = async () => {
            let i = 0;
            const speed = 40; 
            const cleanText = message.replace(/\s+/g, " ").trim();
            while (i <= cleanText.length) {
                setDisplayedText(cleanText.substring(0, i));
                await new Promise(res => setTimeout(res, speed));
                i++;
            }
            setIsTyping(false);
        };

        // Delay slightly to ensure voices load
        setTimeout(() => {
            speak();
            typeText();
        }, 300);
    }, []);

    useEffect(() => {
        if (!isTyping && !isSpeaking) {
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        }
    }, [isTyping, isSpeaking, navigate]);

    return (
        <div className="demo-container">
            <div className="robo-section">
                <img src={ladyFace} alt="Lady Avatar" className="lady-image" />
                <div className="speech-box">
                    <p className="typed-text">{displayedText}</p>
                </div>
            </div>
        </div>
    );
}

export default Demo;
