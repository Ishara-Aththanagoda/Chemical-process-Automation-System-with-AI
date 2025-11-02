import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Scale.css';

const Scale = () => {
    const [weight, setWeight] = useState(0.0);

    useEffect(() => {
        const interval = setInterval(() => {
            axios.get('http://127.0.0.1:5000/get_weight')
                .then(response => {
                    console.log("Received:", response.data);
                    if (response.data && typeof response.data.weight === 'number') {
                        setWeight(response.data.weight);
                    }
                })
                .catch(error => {
                    console.error("Error fetching weight:", error);
                });
        }, 1000);

        return () => clearInterval(interval);
    }, []);


    return (
        <div className="scale-container">
            <h2 className="scale-title">Live Scale Reading</h2>
            <p className="scale-weight">{weight} <span className="unit">kg</span></p>
        </div>
    );
};

export default Scale;
