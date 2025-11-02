import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Report.css';

function Report() {
    const location = useLocation();
    const navigate = useNavigate();
    const reportUrl = location.state?.reportUrl;

    const [loading, setLoading] = useState(true);
    const [imageExists, setImageExists] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(null);
    const [phone, setPhone] = useState('+94771234567'); 

    useEffect(() => {
        if (!reportUrl) {
            setLoading(false);
            setImageExists(false);
            return;
        }

        const img = new Image();
        img.src = reportUrl;

        img.onload = () => {
            setLoading(false);
            setImageExists(true);
        };

        img.onerror = () => {
            setLoading(false);
            setImageExists(false);
        };
    }, [reportUrl]);

    const handlePrint = () => {
        const printWindow = window.open(reportUrl, '_blank');
        if (printWindow) {
            printWindow.focus();
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    };

    const handleSendSMS = async () => {
        setSending(true);
        setSent(null);
        try {
            const response = await fetch('/api/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportUrl, phone }),
            });

            if (response.ok) {
                setSent('success');
            } else {
                throw new Error('Failed to send SMS');
            }
        } catch (error) {
            console.error('SMS sending failed:', error);
            setSent('error');
        } finally {
            setSending(false);
        }
    };

    if (!reportUrl) {
        return (
            <div className="report-container error">
                <h2>⚠️ Report Not Ready</h2>
                <p>Please complete the batch process first.</p>
                <button onClick={() => navigate(-1)} className="back-button">
                    ⬅️ Go Back
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="report-container loading">
                <h2>⏳ Generating Report...</h2>
                <p>Please wait while the batch report is being created.</p>
            </div>
        );
    }

    if (!imageExists) {
        return (
            <div className="report-container error">
                <h2>❌ Failed to Load Report</h2>
                <p>The report image could not be loaded. Please try again.</p>
                <button onClick={() => navigate(-1)} className="back-button">
                    ⬅️ Back to Process
                </button>
            </div>
        );
    }

    return (
        <div className="report-container">
            <h2 className="report-title">📄 Chemical Batch Report</h2>

            <div className="report-image-wrapper">
                <img src={reportUrl} alt="Chemical Batch Report" className="report-image" />
            </div>

            <div className="report-actions">
                <a href={reportUrl} download className="download-button">⬇️ Download</a>
                <button onClick={handlePrint} className="print-button">🖨️ Print</button>
                <button onClick={() => navigate(-1)} className="back-button">⬅️ Back</button>
            </div>

            <div className="sms-section">
                <input
                    type="text"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="phone-input"
                />
                <button onClick={handleSendSMS} className="send-button" disabled={sending}>
                    📱 {sending ? 'Sending...' : 'Send to Phone'}
                </button>
            </div>

            {sent === 'success' && <p className="success-msg">✅ SMS sent successfully!</p>}
            {sent === 'error' && <p className="error-msg">❌ Failed to send SMS.</p>}
        </div>
    );
}

export default Report;
