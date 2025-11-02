import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import './SupervisorLogin.css';

const SupervisorLogin = () => {
    const navigate = useNavigate();
    const scannerRef = useRef(null);
    const isScannerRunningRef = useRef(false);
    const [scanningError, setScanningError] = useState(null);

    useEffect(() => {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        const startScanner = async () => {
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

                                // Small delay to allow camera shutdown before navigation
                                setTimeout(() => {
                                    navigate('/chemicalprocess');
                                }, 200);
                            } else {
                                alert('Invalid QR code credentials');
                            }
                        } catch (err) {
                            console.error("Error processing QR content: ", err);
                            setScanningError("Failed to read QR content.");
                        }
                    },
                    (errorMessage) => {
                        console.warn(`QR Code scan error: ${errorMessage}`);
                    }
                );
                isScannerRunningRef.current = true;
            } catch (err) {
                console.error("Unable to start scanner: ", err);
                setScanningError("Could not start the QR scanner. Please check camera permissions.");
            }
        };

        startScanner();

        return () => {
            const stopScanner = async () => {
                try {
                    if (isScannerRunningRef.current && scannerRef.current) {
                        await scannerRef.current.stop();
                        await scannerRef.current.clear();
                        isScannerRunningRef.current = false;
                    }
                } catch (err) {
                    console.warn("Failed to stop scanner on unmount:", err.message);
                }
            };
            stopScanner();
        };
    }, [navigate]);

    return (
        <div className="supervisor-login">
            <h2>Supervisor QR Code Login</h2>
            <div id="qr-reader" style={{ width: "300px", margin: "0 auto" }}></div>
            {scanningError && <p className="error-message">{scanningError}</p>}
        </div>
    );
};

export default SupervisorLogin;
