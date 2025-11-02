import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Bill.css"; // optional for styling

const Bill = ({ billData }) => {
    const billRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => billRef.current,
        documentTitle: `Chemical_Bill_${billData?.batchNo || "Unknown"}`
    });

    const handleDownloadPDF = async () => {
        const element = billRef.current;
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
        pdf.save(`Chemical_Bill_${billData?.batchNo || "Unknown"}.pdf`);
    };

    return (
        <div className="bill-wrapper">
            <div className="bill-actions">
                <button onClick={handlePrint} className="btn print-btn">🖨️ Print</button>
                <button onClick={handleDownloadPDF} className="btn pdf-btn">📥 Download PDF</button>
            </div>

            <div className="bill-container" ref={billRef}>
                <h1 className="bill-header">🧪 Chemical Batch Report</h1>
                <div className="bill-info">
                    <p><strong>Operator Name:</strong> {billData.operatorName}</p>
                    <p><strong>Operator No:</strong> {billData.operatorId}</p>
                    <p><strong>Date:</strong> {billData.date}</p>
                    <p><strong>Time:</strong> {billData.time}</p>
                    <p><strong>Batch No:</strong> {billData.batchNo}</p>
                </div>

                <table className="bill-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Chemical Name</th>
                            <th>Required Weight (g)</th>
                            <th>Measured Weight (g)</th>
                            <th>Supervisor Edited?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {billData.chemicals.map((chem, idx) => (
                            <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>{chem.name}</td>
                                <td>{chem.required}</td>
                                <td>{chem.measured}</td>
                                <td>{chem.edited ? `Yes (${chem.supervisor})` : "No"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="bill-footer">
                    <p><strong>Supervisor Approval:</strong> {billData.supervisor || "N/A"}</p>
                    <p className="signature-line">Operator Signature: __________________</p>
                    <p className="signature-line">Supervisor Signature: __________________</p>
                </div>
            </div>
        </div>
    );
};

export default Bill;
