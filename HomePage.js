import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HomePage.css";

import img1 from "./img_5.png";
import img2 from "./img_2.png";
import img7 from "./img_7.png";
import img8 from "./img_8.png";
import img9 from "./img_9.png";
import img10 from "./img_10.png";
import img11 from "./img_11.png";
import img12 from "./img_12.png";
import img13 from "./img_13.png";
import img14 from "./img_14.png";
import audioFile from "./corporate-338336.mp3";
import Clock from "./Clock";

function HomePage() {
    const navigate = useNavigate();
    const recognitionRef = useRef(null);
    const audioRef = useRef(null);

    // Background audio autoplay
    useEffect(() => {
        const handleInteraction = () => {
            if (audioRef.current) {
                audioRef.current.play().catch((err) => {
                    console.warn("Autoplay blocked:", err);
                });
            }
        };
        document.addEventListener("click", handleInteraction);
        return () => document.removeEventListener("click", handleInteraction);
    }, []);

    // Voice command logic
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const lastTranscript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            console.log("Voice Command:", lastTranscript);

            if (lastTranscript.includes("register")) {
                navigate("/register");
            } else if (lastTranscript.includes("login")) {
                navigate("/login");
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
        };

        recognitionRef.current = recognition;
        recognition.start();

        return () => recognition.stop();
    }, [navigate]);

    return (
        <div className="homepage-container">
            <Clock />
            <audio ref={audioRef} src={audioFile} loop autoPlay />

            {/* Header with logo and scrolling banner */}
            <div className="header">
                <img src={img2} alt="Company Logo" className="logo-left" />

                <div className="scrolling-banner">
                    <p>
                        🦺 Safety First පළමුව ආරක්ෂාව 🦺 &nbsp;&nbsp;
                        🔒 Report unsafe conditions immediately to your supervisor අනාරක්ෂිත තත්ත්වයන් වහාම ඔබේ අධීක්ෂක වෙත වාර්තා කරන්න.
                        🔒 &nbsp;&nbsp;
                        ⚠️ Know the location of emergency exits and fire extinguishers. හදිසි පිටවීම් සහ ගිනි නිවන උපකරණවල පිහිටීම දැන ගන්න. ⚠️ &nbsp;&nbsp;
                        🦺 Never operate equipment without proper training. නිසි පුහුණුවකින් තොරව උපකරණ කිසි විටෙකත් ක්‍රියාත්මක නොකරන්න. 🦺 &nbsp;&nbsp;
                        🔒 Ensure proper ventilation when handling chemicals. රසායනික ද්‍රව්‍ය හැසිරවීමේදී නිසි වාතාශ්‍රය සහතික කරන්න.🔒 &nbsp;&nbsp;
                        ⚠️ Avoid shortcuts — safety comes before speed. කෙටිමං වලින් වළකින්න - ආරක්ෂාව වේගයට වඩා වැදගත්.⚠️ &nbsp;&nbsp;
                        ⚠️ Stay alert. Stay alive. ⚠️&nbsp;&nbsp;
                        නිෂ්පාදන ප්‍රදේශයට ඇතුළු වීමට පෙර සෑම විටම ඔබේ පුද්ගලික ආරක්ෂක උපකරණ පැළඳ ගන්න.
                    </p>
                </div>

                <Link to="/demo">
                    <img src={img1} alt="Demo" className="logo-right" />
                </Link>
            </div>

            {/* Sidebar with vertical images */}
            <div className="image-sidebar">
                <Link to="/chatbot">
                    <img src={img7} alt="ChatBot" />
                </Link>

                <img src={img8} alt="Icon 2" />

                <Link to="/cal">
                    <img src={img9} alt="Cal" />
                </Link>

                <Link to="/Help">
                    <img src={img10} alt="Help" />
                </Link>

                <Link to="/Health">
                    <img src={img11} alt="Health" />
                </Link>

                <Link to="/Safety">
                    <img src={img12} alt="Safety" />
                </Link>
                <Link to="/Quiz">
                    <img src={img13} alt="Quiz" />
                </Link>

                <Link to="/Scale">
                    <img src={img14} alt="Scale" />
                </Link>

            </div>

            {/* Main homepage content */}
            <div className="homepage-content">
                <h1 className="company-name">🔬 SAT CHEMXPERT</h1>
                <h2 className="tagline1">South Asia Textiles Limited</h2>
                <p className="tagline2">Precision in Process, Excellence in Outcome</p>

                <div className="cta-buttons">
                    <Link to="/register" className="homepage-button">GET START</Link>
                </div>


            </div>
        </div >
    );
}

export default HomePage;
