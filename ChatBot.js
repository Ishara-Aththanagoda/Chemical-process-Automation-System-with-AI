// ChatBot.js
import React, { useState, useRef, useEffect } from "react";
import "./ChatBot.css";
import { Send } from "lucide-react";

const scriptedResponses = [
    {
        keywords: ["ppe", "equipment", "protection"],
        response: "🦺 PPE stands for Personal Protective Equipment. It includes gloves, helmets, goggles, and other safety gear designed to protect you from hazards."
    },
    {
        keywords: ["emergency", "exit", "evacuation"],
        response: "🚪 Emergency exits are marked with illuminated signs. In case of an emergency, follow the nearest exit route and do not use elevators."
    },
    {
        keywords: ["fire", "extinguisher", "flame"],
        response: "🔥 Fire extinguishers are available at multiple locations and are marked with red signage. Only use them if you're trained and it's safe."
    },
    {
        keywords: ["spill", "chemical", "hazard"],
        response: "🧪 In the event of a chemical spill, evacuate the area immediately and inform your supervisor. Do not attempt to clean it without training."
    },
    {
        keywords: ["first aid", "injury", "hurt", "kit"],
        response: "🩹 First aid kits are available in the supervisor's office and at strategic locations. Report all injuries, even minor ones, immediately."
    },
    {
        keywords: ["report", "unsafe", "hazard", "risk"],
        response: "📋 Always report unsafe conditions to your supervisor. Timely reporting prevents accidents and keeps everyone safe."
    },
    {
        keywords: ["ventilation", "fume", "smell", "gas"],
        response: "💨 Ensure proper ventilation when working with chemicals. Use exhaust systems or work in well-ventilated areas to avoid inhalation hazards."
    }
];

const ChatBot = () => {
    const [messages, setMessages] = useState([
        { sender: "bot", text: "👋 Hello! I'm your Virtual Safety Assistant. Ask me anything about workplace safety." }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getBotResponse = (inputText) => {
        const lower = inputText.toLowerCase();
        for (let topic of scriptedResponses) {
            if (topic.keywords.some(word => lower.includes(word))) {
                return topic.response;
            }
        }
        return "🤖 I'm here to help with safety-related queries. Try asking about PPE, fire, spills, or first aid.";
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages(prev => [...prev, userMessage]);

        const botReply = getBotResponse(input);

        setTimeout(() => {
            setMessages(prev => [...prev, { sender: "bot", text: botReply }]);
        }, 500);

        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSend();
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">🛡️ Virtual Safety Assistant</div>
            <div className="chatbot-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.sender}`}>
                        <div className="message-text">{msg.text}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="chatbot-input-area">
                <input
                    type="text"
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={handleSend}><Send size={18} /></button>
            </div>
        </div>
    );
};

export default ChatBot;
