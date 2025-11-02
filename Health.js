// Health.js
import React from "react";
import "./Health.css";

const wellnessIdeas = [
    {
        emoji: "🏃‍♂️",
        title: "Move Often, Stay Strong",
        description:
            "Regular movement reduces fatigue, boosts mood, and prevents injuries. Encourage stretch breaks, walking meetings, and light physical activity throughout the day.",
        tip: "Start with 5-minute stretch breaks every 2 hours to reduce muscle stiffness and improve focus.",
    },
    {
        emoji: "🥗",
        title: "Nutrition Fuels Productivity",
        description:
            "A balanced diet supports energy, memory, and immune function. Offer nutritious snacks, hydration reminders, and lunch-n-learn sessions about healthy eating.",
        tip: "Hydration tip: 8 cups of water daily. Add fruit slices or herbs for variety.",
    },
    {
        emoji: "🧠",
        title: "Mental Health Matters",
        description:
            "Create a stigma-free culture where mental well-being is openly supported. Offer access to therapists, quiet zones, meditation apps, and emotional first aid guides.",
        tip: "Try box breathing: Inhale 4s, hold 4s, exhale 4s, hold 4s — repeat 4 times to reset your nervous system.",
    },
    {
        emoji: "😴",
        title: "Rest Restores Performance",
        description:
            "Sleep is the foundation of focus and safety. Promote smart scheduling, naps on long shifts, and digital detox habits to help employees recover well.",
        tip: "Power naps of 15–20 minutes during break time improve alertness and decision-making.",
    },
    {
        emoji: "🩺",
        title: "Preventive Care First",
        description:
            "Empower your team to stay ahead of illness. Provide regular checkups, flu shots, ergonomic assessments, and health risk screenings.",
        tip: "Encourage annual full-body checkups and create a culture where proactive care is a norm, not an exception.",
    }
];

const Health = () => {
    return (
        <div className="health-container">
            <h1>💚 Employee Wellness First</h1>
            <p className="intro">
                At our company, your health is not just important — it's essential. We believe that well-being drives performance, safety, and happiness.
            </p>

            <div className="wellness-cards">
                {wellnessIdeas.map((item, index) => (
                    <div className="health-card" key={index}>
                        <div className="emoji">{item.emoji}</div>
                        <h2>{item.title}</h2>
                        <p>{item.description}</p>
                        <div className="tip">💡 {item.tip}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Health;
