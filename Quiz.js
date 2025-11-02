// Quiz.js
import React, { useState, useEffect } from "react";
import "./Quiz.css";

const quizData = [
    {
        question: "ගිනි හදිසි අවස්ථාවකදී ගත යුතු පළමු පියවර කුමක්ද?",
        options: ["911 අමතන්න", "ඉවත් කරන්න", "නිවන උපකරණ භාවිතා කරන්න", "භීතිය"],
        answer: "ඉවත් කරන්න",
    },
    {
        question: "PPE යන්නෙන් අදහස් කරන්නේ කුමක්ද?",
        options: [
            "Professional Protection Equipment",
            "Personal Protective Equipment",
            "Personal Performance Equipment",
            "Protection Preventive Essentials",
        ],
        answer: "Personal Protective Equipment",
    },
    {
        question: "Where are fire extinguishers usually placed?",
        options: ["Under desks", "Near exits", "Inside lockers", "Next to elevators"],
        answer: "Near exits",
    },
    {
        question: "How often should safety drills be conducted?",
        options: ["Yearly", "Biannually", "Monthly", "Weekly"],
        answer: "Monthly",
    },
];

const Quiz = () => {
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(() => parseInt(localStorage.getItem("safety_score")) || 0);
    const [isFinished, setIsFinished] = useState(false);

    const handleSelect = (option) => {
        setSelected(option);
    };

    const handleNext = () => {
        if (selected === quizData[current].answer) {
            setScore((prev) => {
                const updatedScore = prev + 1;
                localStorage.setItem("safety_score", updatedScore);
                return updatedScore;
            });
        }
        setSelected(null);
        if (current + 1 < quizData.length) {
            setCurrent(current + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handleRetry = () => {
        setCurrent(0);
        setSelected(null);
        setScore(0);
        setIsFinished(false);
        localStorage.removeItem("safety_score");
    };

    const progress = ((current + 1) / quizData.length) * 100;

    return (
        <div className="quiz-container">
            <h2>🛡️ Safety Awareness Quiz</h2>

            {!isFinished ? (
                <>
                    <div className="progress-bar">
                        <div className="fill" style={{ width: `${progress}%` }}></div>
                    </div>

                    <div className="quiz-card">
                        <h3>{quizData[current].question}</h3>
                        <div className="options">
                            {quizData[current].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    className={`option ${selected === option ? "selected" : ""}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        <button
                            className="next-btn"
                            onClick={handleNext}
                            disabled={selected === null}
                        >
                            {current + 1 === quizData.length ? "Finish" : "Next"}
                        </button>
                    </div>
                </>
            ) : (
                <div className="result-card">
                    <h3>🎉 Quiz Completed!</h3>
                    <p>
                        You scored <strong>{score}</strong> out of{" "}
                        <strong>{quizData.length}</strong>
                    </p>
                    <button className="retry-btn" onClick={handleRetry}>
                        Retry Quiz
                    </button>
                </div>
            )}
        </div>
    );
};

export default Quiz;
