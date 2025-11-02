import React, { useEffect, useState } from "react";
import "./History.css";

const History = () => {
    const [historyData, setHistoryData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        // Example: Load history from localStorage or an API
        const saved = localStorage.getItem("chemical_history");
        if (saved) {
            setHistoryData(JSON.parse(saved));
        }
    }, []);

    const filteredData = historyData.filter(
        (item) =>
            item.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.operatorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToCSV = () => {
        const header = [
            "Date,Time,Batch No,Operator,Supervisor,Chemical,Required,Measured,Edited,Edited By",
        ];
        const rows = historyData.flatMap((entry) =>
            entry.chemicals.map((chem) => {
                return [
                    entry.date,
                    entry.time,
                    entry.batchNo,
                    entry.operatorName,
                    entry.supervisor || "N/A",
                    chem.name,
                    chem.required,
                    chem.measured,
                    chem.edited ? "Yes" : "No",
                    chem.edited ? chem.supervisor : "N/A",
                ].join(",");
            })
        );
        const csv = header.concat(rows).join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "chemical_batch_history.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="history-container">
            <h2>📜 Chemical Batch History</h2>
            <div className="history-controls">
                <input
                    type="text"
                    placeholder="Search by Batch No / Operator"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={exportToCSV} className="btn export-btn">
                    📤 Export CSV
                </button>
            </div>

            <div className="history-table-wrapper">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Batch No</th>
                            <th>Operator</th>
                            <th>Supervisor</th>
                            <th>Chemical</th>
                            <th>Required</th>
                            <th>Measured</th>
                            <th>Edited</th>
                            <th>Edited By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="10">No history data found.</td>
                            </tr>
                        ) : (
                            filteredData.map((entry, i) =>
                                entry.chemicals.map((chem, j) => (
                                    <tr key={`${i}-${j}`}>
                                        <td>{entry.date}</td>
                                        <td>{entry.time}</td>
                                        <td>{entry.batchNo}</td>
                                        <td>{entry.operatorName}</td>
                                        <td>{entry.supervisor || "N/A"}</td>
                                        <td>{chem.name}</td>
                                        <td>{chem.required}</td>
                                        <td>{chem.measured}</td>
                                        <td>{chem.edited ? "Yes" : "No"}</td>
                                        <td>{chem.edited ? chem.supervisor : "N/A"}</td>
                                    </tr>
                                ))
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;
