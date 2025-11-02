import { useEffect } from "react";

// VoiceAssistant triggers a spoken message using Web Speech API
const VoiceAssistant = ({ stage, batchNumber, chemicalName, requiredWeight, operator, supervisor }) => {
    useEffect(() => {
        if (!stage) return;

        const synth = window.speechSynthesis;
        let message = "";

        switch (stage) {
            case "welcome":
                message = `Welcome ${operator || "Operator"}. Please scan your batch sheet to begin.`;
                break;

            case "batch_scan":
                message = `Batch ${batchNumber} recognized. Preparing chemical list.`;
                break;

            case "start_chemical":
                message = `Start measuring ${chemicalName}. Required weight is ${requiredWeight} kilograms.`;
                break;

            case "weight_ok":
                message = `Good job. ${chemicalName} weight is within the allowed range. Proceed to the next chemical.`;
                break;

            case "weight_high":
                message = `Warning. ${chemicalName} weight is too high. Please reduce the weight.`;
                break;

            case "weight_low":
                message = `Warning. ${chemicalName} weight is too low. Please add more.`;
                break;

            case "re_measure_denied":
                message = `Batch ${batchNumber} has already been measured. Supervisor permission required to proceed.`;
                break;

            case "re_measure_approved":
                message = `Supervisor ${supervisor} has approved re-measurement for batch ${batchNumber}. You may begin.`;
                break;

            case "completed":
                message = `All chemicals have been measured. Preparing final bill.`;
                break;

            case "print_bill":
                message = `Bill is ready. Sending to printer.`;
                break;

            default:
                return;
        }

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = "en-US";
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        synth.cancel(); // Cancel any previous speech
        synth.speak(utterance);

        return () => synth.cancel();
    }, [stage, batchNumber, chemicalName, requiredWeight, operator, supervisor]);

    return null;
};

export default VoiceAssistant;
