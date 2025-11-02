import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ChemicalProcess.css';
import { Html5Qrcode } from 'html5-qrcode';
import { useRef } from 'react';


function ChemicalProcess() {
    const [batchNumber, setBatchNumber] = useState('');
    const [chemicals, setChemicals] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [error, setError] = useState('');
    const [liveWeight, setLiveWeight] = useState(0);
    const [editWeight, setEditWeight] = useState('');
    const [isSupervisor, setIsSupervisor] = useState(false);
    const [authVisible, setAuthVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [reportUrl, setReportUrl] = useState('');
    const [isWeightMatched, setIsWeightMatched] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const navigate = useNavigate();
    const scannerRef = useRef(null);
    const isScannerRunningRef = useRef(false);
    const [batchCompleted, setBatchCompleted] = useState(false);
    const [isQRScannerVisible, setIsQRScannerVisible] = useState(true);
    const qrScannerRef = useRef(null);
    const [currentChemicalIndex, setCurrentChemicalIndex] = useState(0);
    const [operator, setOperator] = useState({ name: "", epf: "" });
    const [chemicalList, setChemicalList] = useState([]);
    const [operatorName, setOperatorName] = useState('');
    const [operatorEPF, setOperatorEPF] = useState('');
    const [chemicalProcessData, setChemicalProcessData] = useState([]);

    const handleEditChange = (e) => {
        setEditWeight(e.target.value);
    };

    const handleSupervisorEdit = () => {
        if (!editWeight || isNaN(editWeight)) {
            alert("Please enter a valid weight");
            return;
        }

        const updatedChemicals = [...chemicals];
        updatedChemicals[currentChemicalIndex] = {
            ...updatedChemicals[currentChemicalIndex],
            actualWeight: parseFloat(editWeight),
            wasEdited: true,
            editedWeight: parseFloat(editWeight),
            wasSkipped: false
        };

        setChemicals(updatedChemicals);
        setIsWeightMatched(true);
        speakMessage("Supervisor weight override accepted");
    };

    const handleSkipChemical = () => {
        const updatedChemicals = [...chemicals];
        updatedChemicals[currentChemicalIndex] = {
            ...updatedChemicals[currentChemicalIndex],
            wasSkipped: true,
            actualWeight: 0,
            editedWeight: null,
            wasEdited: false
        };

        setChemicals(updatedChemicals);
        speakMessage("Chemical skipped");
        showNext();
    };


    useEffect(() => {
        if (isQRScannerVisible && !isScannerRunningRef.current) {
            const qrScanner = new Html5Qrcode("batch-qr-reader");
            qrScannerRef.current = qrScanner;

            qrScanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText, decodedResult) => {
                    setBatchNumber(decodedText);
                    qrScanner.stop().then(() => {
                        qrScanner.clear();
                        setIsQRScannerVisible(false);
                        isScannerRunningRef.current = false;
                    }).catch((err) => {
                        console.error("Failed to stop QR scanner:", err);
                    });
                },
                (errorMessage) => {

                }
            ).then(() => {
                isScannerRunningRef.current = true;
            }).catch(err => {
                console.error("Failed to start QR scanner:", err);
            });
        }
    }, [isQRScannerVisible]);


    useEffect(() => {
        if (batchNumber && isQRScannerVisible && qrScannerRef.current && isScannerRunningRef.current) {
            qrScannerRef.current.stop().then(() => {
                qrScannerRef.current.clear();
                setIsQRScannerVisible(false);
                isScannerRunningRef.current = false;
            }).catch((err) => {
                console.error("Failed to stop QR scanner on manual entry:", err);
            });
        }
    }, [batchNumber]);



    useEffect(() => {
        return () => {
            if (qrScannerRef.current && isScannerRunningRef.current) {
                qrScannerRef.current.stop().then(() => {
                    qrScannerRef.current.clear();
                    isScannerRunningRef.current = false;
                }).catch((err) => {
                    console.error("Cleanup error:", err);
                });
            }
        };
    }, []);


    useEffect(() => {
        if (batchCompleted) {
            speakMessage("ok Batch completed successfully and have a nice day");
        }
    }, [batchCompleted]);


    useEffect(() => {
        const interval = setInterval(fetchLiveWeight, 300);
        return () => clearInterval(interval);
    }, [chemicals, currentIndex, editWeight, isSupervisor]);


    useEffect(() => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            console.log("🎙️ Voice command heard:", transcript);

            if (transcript.includes("submit")) {
                handleSubmit();
            }
            if (transcript.includes("supervisor")) {
                setAuthVisible(true);
            }
            if (transcript.includes("qr scan")) {
                startQRScanner();
            }
            if (transcript.includes("next")) {
                if (isWeightMatched || isSupervisor) {
                    showNext();
                }
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event);
        };

        recognition.start();

        return () => {
            recognition.stop();
        };
    }, [isWeightMatched, isSupervisor, chemicals, currentIndex, batchNumber]);


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


    const fetchLiveWeight = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:5000/get_weight');
            const weightValue = parseFloat(res.data.weight);

            if (!isNaN(weightValue)) {
                setLiveWeight(weightValue);
                evaluateWeight(weightValue);
            } else {
                setLiveWeight('Invalid');
                setIsWeightMatched(false);
            }
        } catch (err) {
            setLiveWeight('Error');
            setIsWeightMatched(false);
        }
    };

    const evaluateWeight = (currentWeight) => {
        if (!chemicals.length) return;

        const expected = isSupervisor && editWeight
            ? parseFloat(editWeight)
            : parseFloat(chemicals[currentIndex].weight);

        const tolerance = 0.01;
        const maxAllowed = expected + 0.05;

        if (isNaN(expected) || isNaN(currentWeight)) {
            setIsWeightMatched(false);
            return;
        }

        if (currentWeight > maxAllowed) {
            setIsWeightMatched(false);
        } else if (Math.abs(expected - currentWeight) <= tolerance) {
            setIsWeightMatched(true);
        } else {
            setIsWeightMatched(false);
        }
    };

    const handleSubmit = async () => {
        if (!batchNumber.trim()) {
            setError('Please enter a valid batch number.');
            return;
        }

        setIsLoading(true);
        setError('');
        setChemicals([]);
        setCurrentIndex(0);
        setShowResult(false);
        setReportUrl('');
        setIsCompleted(false);

        try {
            const response = await axios.post('http://127.0.0.1:5000/get_chemicals', {
                batch_number: batchNumber.trim(),
            });

            const data = response.data.chemicals;
            if (data && data.length > 0) {
                setChemicals(data);
                setShowResult(true);
            } else {
                setError('No chemicals found for this batch number.');
            }
        } catch (err) {
            setError('Server error: Unable to fetch chemicals.');
        } finally {
            setIsLoading(false);
        }
    };

    const startQRScanner = async () => {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

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
                        const username = params.get('username');
                        const password = params.get('password');

                        if (username === 'supervisor' && password === 'textile123') {
                            if (isScannerRunningRef.current && scannerRef.current) {
                                isScannerRunningRef.current = false;
                                await scannerRef.current.stop();
                                await scannerRef.current.clear();
                            }
                            setIsSupervisor(true);
                            setAuthVisible(false);
                        } else {
                            alert('Invalid QR code credentials');
                        }
                    } catch (err) {
                        console.error("Error processing QR content: ", err);
                        alert("QR content unreadable.");
                    }
                },
                (errorMessage) => {
                    console.warn("QR Code scan error:", errorMessage);
                }
            );
            isScannerRunningRef.current = true;
        } catch (err) {
            console.error("Unable to start scanner:", err);
            alert("QR scanner failed to start. Please check camera permissions.");
        }
    };

    const startBatchQRScanner = async () => {
        const scanner = new Html5Qrcode("batch-qr-reader");
        scannerRef.current = scanner;

        try {
            await scanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 200, height: 200 },
                },
                async (decodedText) => {
                    console.log("📦 QR Code Scanned (Batch):", decodedText);
                    setBatchNumber(decodedText);
                    setIsQRScannerVisible(false);
                    await scanner.stop();
                    await scanner.clear();
                },
                (errorMessage) => {
                    console.warn("❌ Batch QR Scan error:", errorMessage);
                }
            );
            isScannerRunningRef.current = true;
        } catch (err) {
            console.error("⚠️ Batch QR scanner failed to start:", err);
            alert("Batch QR scanner failed to start.");
        }
    };


    const showNext = async () => {
        if (currentIndex + 1 < chemicals.length) {
            setCurrentIndex(currentIndex + 1);
            setEditWeight('');
            setIsWeightMatched(false);
        } else {
            setShowResult(false);
            setIsCompleted(true);
            setBatchCompleted(true);

            try {
                const res = await axios.post('http://127.0.0.1:5000/generate_report', {
                    batch_number: batchNumber.trim(),
                    chemicals: chemicals,
                    operator: operator,
                });

                console.log("Report Response:", res.data);
                if (res.data && res.data.report_url) {
                    setReportUrl(res.data.report_url);
                    console.log("✅ Report URL:", res.data.report_url);
                } else {
                    console.warn("⚠️ Report URL missing in response");
                }
            } catch (err) {
                console.error("❌ Report generation failed:", err);
            }
        }
    };



    const getLiveWeightBoxStyle = () => {
        const expected = isSupervisor && editWeight
            ? parseFloat(editWeight)
            : parseFloat(chemicals[currentIndex].weight);

        const current = parseFloat(liveWeight);

        if (isNaN(expected) || isNaN(current)) {
            return { backgroundColor: '#f8d7da' };
        }

        const tolerance = 0.01;
        const maxAllowed = expected + 0.05;

        if (current > maxAllowed) {
            return { backgroundColor: '#a83703' };
        }

        if (Math.abs(current - expected) <= tolerance) {
            return { backgroundColor: '#d4edda' };
        }

        return { backgroundColor: '#faf61e' };
    };


    const handleSubmitProcess = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/submit_process", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    batch_number: batchNumber,
                    operator: operator,
                    chemicals: chemicalList,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                console.log("✅ Process submitted:", result);
                alert("Process successfully submitted!");
            } else {
                console.error("❌ Submission failed:", result);
                alert("Error submitting process.");
            }
        } catch (error) {
            console.error("🔥 Error:", error);
            alert("Network or server error.");
        }
    };



    return (
        <div style={{ padding: 30, fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ fontSize: '50px' }}>Chemical Weighting Process</h2>

            <div style={{ marginTop: 20 }}>
                <label style={{ fontSize: 22 }}>Batch Number (Manual or QR):</label><br />

                <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="Enter batch number"
                    style={{ padding: 18, width: 500, marginTop: 15, fontSize: 18 }}
                />
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    style={{
                        marginLeft: 10,
                        padding: '18px 26px',
                        backgroundColor: '#1f6feb',
                        color: 'white',
                        border: 'none',
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isLoading ? 'Loading...' : 'Submit'}
                </button>
                <button
                    onClick={() => setAuthVisible(true)}
                    style={{
                        marginLeft: 10,
                        padding: '18px 26px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Supervisor Login
                </button>

                <div style={{ position: 'relative', width: '100%' }}>
                    {isQRScannerVisible && (
                        <div id="batch-qr-reader" style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            margin: 15,
                            width: 250,
                            height: 250,
                            border: '2px solid #ccc',
                            borderRadius: 10,
                            zIndex: 1000,
                            backgroundColor: 'white'
                        }}></div>
                    )}
                </div>


                {!isQRScannerVisible && (
                    <button
                        onClick={() => setIsQRScannerVisible(true)}
                        style={{
                            marginTop: 10,
                            padding: '10px 20px',
                            backgroundColor: '#198754',
                            color: 'white',
                            border: 'none',
                            borderRadius: 5,
                            cursor: 'pointer'
                        }}
                    >
                        QR Scanner
                    </button>
                )}
            </div>


            {authVisible && (
                <div style={{
                    marginTop: 20,
                    padding: 15,
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ccc',
                    borderRadius: 8,
                    width: 'fit-content'
                }}>
                    <h4 style={{ marginBottom: 10 }}>Supervisor QR Login</h4>

                    <div id="qr-reader" style={{ width: "300px", marginTop: 10 }}></div>

                    <button
                        onClick={startQRScanner}
                        style={{
                            marginTop: 10,
                            padding: '6px 12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer'
                        }}
                    >
                        Start QR Scan
                    </button>
                </div>
            )}


            {error && <p style={{ color: 'red', marginTop: 20 }}>{error}</p>}

            {showResult && chemicals.length > 0 && (
                <div style={{
                    marginTop: 30,
                    backgroundColor: '#f0f4ff',
                    padding: 20,
                    borderRadius: 8,
                    boxShadow: '0 0 5px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ fontSize: '26px' }}>Chemical {currentIndex + 1} of {chemicals.length}</h3>
                    <p style={{ fontSize: '22px' }}><strong>Name:</strong> {chemicals[currentIndex].name}</p>

                    <div style={{
                        display: 'flex',
                        gap: 20,
                        marginBottom: 10,
                        marginTop: 10
                    }}>
                        <div style={{
                            backgroundColor: '#d1ecf1',
                            padding: 15,
                            borderRadius: 6,
                            width: '50%',
                            textAlign: 'center',
                            fontSize: 35
                        }}>
                            <strong>Required Weight (kg)</strong><br />
                            <span style={{ fontSize: 100 }}>{isSupervisor && editWeight ? editWeight : chemicals[currentIndex].weight}</span>
                        </div>

                        <div style={{
                            ...getLiveWeightBoxStyle(),
                            padding: 15,
                            borderRadius: 6,
                            width: '50%',
                            textAlign: 'center',
                            fontSize: 35
                        }}>
                            <strong>Live Scale Reading (kg)</strong><br />
                            <span style={{ fontSize: 100 }}>{liveWeight}</span>
                        </div>
                    </div>

                    {isSupervisor && (
                        <div style={{ marginBottom: 10 }}>
                            <label>Edit Weight (kg): </label>
                            <input
                                type="number"
                                value={editWeight}
                                onChange={(e) => setEditWeight(e.target.value)}
                                placeholder="Supervisor override"
                                style={{ padding: 6, width: 120, marginLeft: 5 }}
                            />
                        </div>
                    )}

                    {isWeightMatched && (
                        <button
                            onClick={showNext}
                            style={{
                                marginTop: 10,
                                padding: '10px 26px',
                                backgroundColor: '#6d6de9',
                                color: 'black',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            🗸 Next 🡆

                        </button>

                    )}

                    {isSupervisor && !isWeightMatched && (
                        <button
                            onClick={showNext}
                            style={{
                                marginTop: 10,
                                marginLeft: 10,
                                padding: '8px 16px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Skip to Next
                        </button>
                    )}
                </div>
            )}

            {!showResult && chemicals.length > 0 && (
                <div style={{ marginTop: 30 }}>

                    {batchCompleted && (
                        <h3 style={{ color: 'green' }}>
                            ✅ Batch completed successfully.
                        </h3>
                    )}


                    {isCompleted && (
                        <div style={{ marginTop: 10 }}>
                            <button
                                onClick={() => navigate('/report', { state: { reportUrl } })}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 5,
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginRight: 10
                                }}
                            >
                                📄 View Report
                            </button>

                            <button
                                onClick={handleSubmitProcess}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 5,
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                ✅ Submit Process
                            </button>
                        </div>
                    )}



                </div>
            )}
        </div>
    );
}

export default ChemicalProcess;
