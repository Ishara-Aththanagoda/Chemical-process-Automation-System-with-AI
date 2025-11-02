// Safety.js
import React from "react";
import "./Safety.css";

const safetyTips = [
    {
        emoji: "🧯",
        title: "Fire Awareness & Response",
        description:
            "Train all staff in fire extinguisher use, evacuation routes, and fire-prevention practices. Schedule mock drills every quarter and install visible safety maps.",
        extra: "🔥 Ensure extinguishers are checked monthly and emergency contacts are known by heart."
    },
    {
        emoji: "⚠️",
        title: "Proactive Hazard Reporting",
        description:
            "Empower every employee to report risks immediately — loose cables, slippery floors, or unsafe tools. Reward alertness and quick response.",
        extra: "📸 Let employees submit hazard photos through a mobile dashboard for instant review."
    },
    {
        emoji: "🧠",
        title: "Mind-on-the-Job Culture",
        description:
            "Mental distractions are major causes of injury. Promote mindfulness, mental breaks, and never-rush policies. Fatigue, stress, and multitasking reduce safety.",
        extra: "💡 Add daily 2-min safety huddles at the start of every shift to refocus attention."
    },
    {
        emoji: "🦺",
        title: "PPE Isn’t Optional — It's a Habit",
        description:
            "Personal protective equipment (PPE) is non-negotiable. Make it accessible, comfortable, and enforced by example. Leaders wear it too.",
        extra: "✅ Include weekly PPE fit & wear-checks, and provide training on new equipment updates."
    },
    {
        emoji: "🗣️",
        title: "Speak Up Safety Culture",
        description:
            "Remove fear from safety discussions. Every voice matters. Let workers pause any task they believe is unsafe — no hierarchy, no blame.",
        extra: "📢 Create anonymous safety feedback boxes & town halls to collect honest feedback."
    },
    {
        emoji: "📊",
        title: "Real-Time Safety Dashboard",
        description:
            "Track incidents, near-misses, and improvements live. Make safety performance visible and motivating.",
        extra: "📈 Celebrate accident-free milestones with team rewards and wall-of-fame photos."
    }
];

const Safety = () => {
    return (
        <div className="safety-container">
            <h1>🛡️ Total Safety Culture</h1>
            <p className="safety-intro">
                Safety is not a department — it’s everyone's responsibility. We build a culture where speaking up, looking out, and preparing ahead are daily habits.
            </p>

            <div className="safety-grid">
                {safetyTips.map((tip, index) => (
                    <div className="safety-card" key={index}>
                        <div className="emoji">{tip.emoji}</div>
                        <h2>{tip.title}</h2>
                        <p>{tip.description}</p>
                        <div className="extra-tip">💡 {tip.extra}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Safety;
