// Help.js
import React, { useState, useEffect } from "react";
import "./Help.css";

const topics = [
    {
        title: "Build Knowledge Together",
        emoji: "📚",
        description:
            "ඔබේ විශේෂඥතාව බෙදා ගන්න, මාර්ගෝපදේශ, නිබන්ධන, සහ උපදේශනය වෙත ප්‍රවේශ වන්න. ශක්තිමත් දැනුම බෙදා ගැනීම කණ්ඩායම් තුළ ඔරොත්තු දීමේ හැකියාව සහ අනුවර්තනය වීමේ හැකියාව ඇති කරයි.",

        extra:
            "දිනපතා ඉගෙනීම දිරිමත් කරන්න, බෙදාගත් ජයග්‍රහණ සැමරීමට සහ දිගුකාලීන නවෝත්පාදනය සහ කාර්ය සාධනය සඳහා සහාය වීම සඳහා ඉගෙනීමට මුල් වන සංස්කෘතියක් ගොඩනඟන්න.",
            
        theme: "knowledge",
    },
    {
        title: "Reduce Risks at Work",
        emoji: "🦺",
        description:
            "Learn about safety procedures, emergency protocols, PPE usage, hazard identification, and safe equipment operation.",
        extra:
            "Proactively report risks, participate in drills, and foster a culture where safety is everyone's priority. Prevention saves lives.",
        theme: "safety",
    },
    {
        title: "Support & Confidence",
        emoji: "🤝",
        description:
            "Feeling unsure? You're not alone. Get mentorship, peer guidance, and encouragement — learning by doing builds mastery and courage.",
        extra:
            "Open communication boosts team morale. Leaders should model curiosity, not perfection. Ask questions, give support, and celebrate effort.",
        theme: "confidence",
    },
    {
        title: "Mind Relaxation & Balance",
        emoji: "🧘‍♂️",
        description:
            "Calm minds lead to safer, clearer decisions. Access breathing techniques, quiet zones, focus playlists, and positive mental health tools.",
        extra:
            "Mental well-being improves productivity, safety, and happiness. Take 5-minute recharge breaks, journal thoughts, or connect with someone you trust.",
        theme: "relax",
    },
];

const Help = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % topics.length);
        }, 7000); // Change slide every 7 seconds

        return () => clearInterval(interval);
    }, []);

    const topic = topics[currentSlide];

    return (
        <div className="help-container">
            <h1>🧠 Knowledge & Support Hub</h1>
            <p className="intro">
                A calm mind, confident skills, and shared support build safer, stronger teams.
            </p>

            <div className={`help-slide help-card ${topic.theme}`}>
                <div className="emoji">{topic.emoji}</div>
                <h2>{topic.title}</h2>
                <p>{topic.description}</p>
                <div className="extra">{topic.extra}</div>
                <div className="slide-indicator">
                    {topics.map((_, i) => (
                        <span
                            key={i}
                            className={`dot ${i === currentSlide ? "active" : ""}`}
                        ></span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Help;
