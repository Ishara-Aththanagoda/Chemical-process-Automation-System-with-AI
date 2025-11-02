
import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { Html5Qrcode } from "html5-qrcode";
import { Link } from "react-router-dom";


const Login = () => {
  const webcamRef = useRef(null);
  const [mode, setMode] = useState("face");
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [epf, setEPF] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const qrScannerRef = useRef(null);
  const isQRRunningRef = useRef(false);
  const [qrError, setQRError] = useState("");


  const allowedSupervisors = ["supervisor", "supervisor2", "supervisor3"];
  const supervisorPassword = "textile123";



  const speakMessage = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => voice.name.toLowerCase().includes("female") || voice.name.toLowerCase().includes("woman"));

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.lang = 'en-US';
    utterance.pitch = 1.1;
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  };


  useEffect(() => {
    const startQRScanner = async () => {
      if (mode !== "qr") return;

      const scanner = new Html5Qrcode("qr-reader");
      qrScannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            try {
              const params = new URLSearchParams(decodedText);
              const username = params.get("username");
              const password = params.get("password");

            

            if (allowedSupervisors.includes(username) && password === supervisorPassword) {
              if (qrScannerRef.current) {
                await qrScannerRef.current.stop();
                await qrScannerRef.current.clear();
                isQRRunningRef.current = false;
              }

              setMessage(`✅  Login Successful`);
              speakMessage(`${username} login successful. Welcome to ChemExpert chemical processing area. Please add batch number to start chemical weighing process.`);

            
              try {
                await axios.post("http://localhost:5000/log_qr_login", {
                  name: username,
                  epf: "0000",
                  method: "QR"
                });
              } catch (err) {
                console.error("❌ Failed to log QR login history:", err);
              }

              setTimeout(() => {
                navigate('/chemicalprocess');
              }, 2000);
            } else {
              alert("❌ Invalid QR Code Credentials");
            }

            } catch (err) {
              console.error("Error processing QR code: ", err);
              setQRError("Invalid QR code format.");
            }
          },
          (errorMessage) => {
            console.warn("QR scan error: ", errorMessage);
          }
        );
        isQRRunningRef.current = true;
      } catch (err) {
        console.error("QR Scanner startup failed: ", err);
        setQRError("Could not access camera. Check permissions.");
      }
    };

    startQRScanner();

    return () => {
      const stopScanner = async () => {
        try {
          if (isQRRunningRef.current && qrScannerRef.current) {
            await qrScannerRef.current.stop();
            await qrScannerRef.current.clear();
            isQRRunningRef.current = false;
          }
        } catch (err) {
          console.warn("Error stopping QR scanner: ", err.message);
        }
      };
      stopScanner();
    };
  }, [mode, navigate]);



  const {
    transcript,
    resetTranscript,
  } = useSpeechRecognition();

  const capture = () => {
    const screenshot = webcamRef.current.getScreenshot();
    setImage(screenshot);
  };

  const handleVoiceInput = (fieldSetter) => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false });

    setTimeout(() => {
      SpeechRecognition.stopListening();
      fieldSetter(transcript);
    }, 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const payload = mode === "face"
      ? { image }
      : { name, epf, password };

    try {
      const res = await axios.post("http://localhost:5000/login", payload);
      if (res.data.success) {
        setMessage(`✅ Welcome ${res.data.name}`);
        speakMessage(`Hello ${res.data.name}, welcome to ChemExpert chemical processing area. Please add the batch number by using QR code or Manually to start the chemical weighing process.`);

        setTimeout(() => navigate("/ChemicalProcess"), 2000);
      } else {
        setMessage(res.data.message || "❌ Login failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error.");
    }
  };

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '40px auto',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 6px 26px rgba(0, 0, 0, 0.15)',
        background: '#fff',
        textAlign: 'center',
        transition: 'all 0.3s ease-in-out'
      }}
    >

      <h1>User Login</h1>

      <div className="toggle-buttons">
        <button className={mode === "face" ? "active" : ""} onClick={() => setMode("face")}>Login with Face</button>
        <button className={mode === "form" ? "active" : ""} onClick={() => setMode("form")}>Login with Credentials</button>
        <button className={mode === "qr" ? "active" : ""} onClick={() => setMode("qr")}>Login with QR</button>

      </div>

      <form onSubmit={handleLogin}>


        {mode === "face" ? (
          <div className="form-right">
            {!image ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width={300}
                  height={240}
                />
                <br />
                <button type="button" onClick={capture}>📷 Capture Face</button>
              </>
            ) : (
              <>
                <img src={image} alt="Captured" width={300} height={240} />
                <br />
                <button type="button" onClick={() => setImage(null)}>🔁 Retake</button>
              </>
            )}
          </div>
        ) : (
          <div className="form-area">
            <div className="input-group">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <span onClick={() => handleVoiceInput(setName)} className="mic">🎤</span>
            </div>

            <div className="input-group">
              <input
                type="text"
                placeholder="EPF"
                value={epf}
                onChange={(e) => setEPF(e.target.value)}
              />
              <span onClick={() => handleVoiceInput(setEPF)} className="mic">🎤</span>
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span onClick={() => handleVoiceInput(setPassword)} className="mic">🎤</span>
            </div>

            {mode === "qr" && (
              <div className="qr-scan-container">
                <h3>Supervisor QR Login</h3>
                <div id="qr-reader" style={{ width: "300px", margin: "0 auto" }}></div>
                {qrError && <p className="error-message">{qrError}</p>}
              </div>
            )}


            <button type="submit" className="login-button">Login</button>
          </div>



        )}
      </form>

      {message && <p className="message">{message}</p>}

      <div className="cta-buttons">
        <h3>Don't have any account</h3>
        <Link to="/register" className="homepage-button">Register</Link>
      </div>
    </div>
  );
};

export default Login;
