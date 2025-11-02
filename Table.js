// Table.js
import React, { useState } from "react";
import "./Table.css";

const initialOperators = Array.from({ length: 20 }, (_, i) => ({
    name: `Operator ${i + 1}`,
    image: null,
    shift: i % 2 === 0 ? "Day" : "Night",
    dailyCounts: Array.from({ length: 31 }, () => ({ normal: '', damage: '' }))
}));

const Table = () => {
    const [operators, setOperators] = useState(initialOperators);

    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newOperators = [...operators];
                newOperators[index].image = reader.result;
                setOperators(newOperators);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDailyCountChange = (opIndex, dayIndex, field, value) => {
        const newOperators = [...operators];
        newOperators[opIndex].dailyCounts[dayIndex][field] = value;
        setOperators(newOperators);
    };

    const handleOperatorFieldChange = (index, field, value) => {
        const newOperators = [...operators];
        newOperators[index][field] = value;
        setOperators(newOperators);
    };

    const getTotalNormal = (dailyCounts) => dailyCounts.reduce((sum, day) => sum + (parseInt(day.normal) || 0), 0);
    const getTotalDamage = (dailyCounts) => dailyCounts.reduce((sum, day) => sum + (parseInt(day.damage) || 0), 0);

    return (
        <div className="table-container">
            <h1>Monthly Operator Damage Tracking</h1>
            <div className="table-scroll">
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Image</th>
                            <th>Shift</th>
                            {Array.from({ length: 31 }, (_, i) => (
                                <th key={i}>Day {i + 1}<br />Normal / Damage</th>
                            ))}
                            <th>Total</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {operators.map((operator, opIndex) => {
                            const totalNormal = getTotalNormal(operator.dailyCounts);
                            const totalDamage = getTotalDamage(operator.dailyCounts);
                            const totalOverall = totalNormal + totalDamage;
                            const percentage = totalOverall === 0 ? "0.00" : ((totalNormal / totalOverall) * 100).toFixed(2);

                            return (
                                <tr key={opIndex}>
                                    <td>
                                        <input
                                            type="text"
                                            value={operator.name}
                                            onChange={(e) => handleOperatorFieldChange(opIndex, "name", e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, opIndex)}
                                        />
                                        {operator.image && (
                                            <img
                                                src={operator.image}
                                                alt="Operator"
                                                className="operator-img"
                                            />
                                        )}
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={operator.shift}
                                            onChange={(e) => handleOperatorFieldChange(opIndex, "shift", e.target.value)}
                                        />
                                    </td>
                                    {operator.dailyCounts.map((day, dayIndex) => (
                                        <td key={dayIndex} className="day-cell">
                                            <input
                                                type="number"
                                                className="small-input"
                                                value={day.normal}
                                                placeholder="N"
                                                onChange={(e) =>
                                                    handleDailyCountChange(opIndex, dayIndex, "normal", e.target.value)
                                                }
                                            />
                                            <input
                                                type="number"
                                                className="small-input damage"
                                                value={day.damage}
                                                placeholder="D"
                                                onChange={(e) =>
                                                    handleDailyCountChange(opIndex, dayIndex, "damage", e.target.value)
                                                }
                                            />
                                        </td>
                                    ))}
                                    <td>{totalNormal}</td>
                                    <td>{percentage}%</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;
