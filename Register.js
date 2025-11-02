// src/components/Register.js

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
    const webcamRef = useRef(null);
    const [image, setImage] = useState(null);
    const [mode, setMode] = useState("face"); // face or form
    const [name, setName] = useState("");
    const [epf, setEPF] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [cameraVisible, setCameraVisible] = useState(true);

    const capture = () => {
        const screenshot = webcamRef.current.getScreenshot();
        setImage(screenshot);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !epf || (mode === "face" && !image)) {
            setMessage("❌ Please fill all required fields.");
            return;
        }

        if (mode === "form" && !password) {
            setMessage("❌ Password is required in Form Only mode.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/register", {
                name,
                epf,
                image: mode === "face" ? image : null,
                password: mode === "form" ? password : null,
                mode,
            });

            setMessage(res.data.message);
            setName("");
            setEPF("");
            setPassword("");
            setImage(null);
            if (mode === "face") setCameraVisible(false); // Turn off camera after registration
        } catch (err) {
            console.error(err);
            setMessage("❌ Registration failed.");
        }
    };

    return (
        <div className="register-container">
            <h2>User Registration</h2>

            <div className="toggle-buttons">
                <button
                    className={mode === "face" ? "active" : ""}
                    onClick={() => {
                        setMode("face");
                        setCameraVisible(true);
                        setMessage("");
                    }}
                >
                    Register with Face
                </button>
                <button
                    className={mode === "form" ? "active" : ""}
                    onClick={() => {
                        setMode("form");
                        setCameraVisible(false);
                        setImage(null);
                        setMessage("");
                    }}
                >
                    Register with Form Only
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-area">
                    <div className="form-left">
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="EPF Number"
                            value={epf}
                            onChange={(e) => setEPF(e.target.value)}
                            required
                        />
                        {mode === "form" && (
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        )}
                        <button type="submit">Register</button>
                    </div>

                    {mode === "face" && (
                        <div className="form-right">
                            {cameraVisible && !image && (
                                <>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        width={300}
                                        height={240}
                                    />
                                    <br />
                                    <button type="button" onClick={capture}>
                                        📷 Capture Face
                                    </button>
                                </>
                            )}
                            {image && (
                                <>
                                    <img src={image} alt="Captured" width={300} height={240} />
                                    <br />
                                    <button type="button" onClick={() => setImage(null)}>
                                        🔁 Retake
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </form>

            {message && <p className="message">{message}</p>}
            <div className="cta-buttons">
                <h3>If you have any account</h3>
                <Link to="/login" className="homepage-button">Login</Link>
            </div>
        </div>


    );
};

export default Register;
