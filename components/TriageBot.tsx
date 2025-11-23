import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage, Referral } from '../types';
import { CloseIcon, SendIcon, UserCircleIcon, HeartPulseIcon, ExclamationTriangleIcon, MicrophoneOnIcon, CheckCircleIcon, DocumentTextIcon } from './IconComponents';
import { mockDoctors } from '../data/doctors';
import { mockHospitals } from '../data/hospitals';
import { mockLabTests } from '../data/labs';

interface AITriageAssistantProps {
  onClose: () => void;
  onComplete: (result: {
      triageLevel: 'Emergency' | 'Urgent' | 'Routine';
      symptomSummary: string;
      recommendedAction: string;
      generatedReport: string;
      referrals: Referral[];
      fullConversation: ChatMessage[];
  }) => void;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

const AITriageAssistant: React.FC<AITriageAssistantProps> = ({ onClose, onComplete }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [finalReport, setFinalReport] = useState<any>(null);
  const [step, setStep] = useState(1);
  const recognitionRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  useEffect(() => {
    setMessages([{
      role: 'model',
      text: "Hello! I'm your AI Triage Assistant. To start, please describe your main symptom. You can type or use the microphone to speak."
    }]);
  }, []);

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript); 
    };
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error", event);
      setIsListening(false);
    };
  }, []);
  
  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async (text: string) => {
    const messageToSend = text.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: messageToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const fullHistory = [...messages, userMessage];

    try {
      const isReadyForTriage = messageToSend.toLowerCase().includes("that's all") || messageToSend.toLowerCase().includes("done") || fullHistory.length > 5;

      if (isReadyForTriage) {
        setStep(2); // Move to analysis step
        
        // Prepare context data for the AI
        const doctorsContext = mockDoctors.map(d => ({id: d.id, name: d.name, specialty: d.specialty}));
        const hospitalsContext = mockHospitals.map(h => ({id: h.id, name: h.name, location: h.location, specialties: h.specialties}));
        const labsContext = mockLabTests.map(l => ({id: l.id, name: l.name, category: l.category}));
        
        const triagePrompt = `Based on the conversation, perform a triage analysis. You MUST use the provided lists of doctors, hospitals, and labs for referrals. Select the most appropriate entity and use its exact 'id' and 'name'.
        
        CONVERSATION:
        ${fullHistory.map(m => `${m.role}: ${m.text}`).join('\n')}
        
        AVAILABLE DOCTORS: ${JSON.stringify(doctorsContext)}
        AVAILABLE HOSPITALS: ${JSON.stringify(hospitalsContext)}
        AVAILABLE LABS: ${JSON.stringify(labsContext)}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: triagePrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    triageLevel: { type: Type.STRING, enum: ['Emergency', 'Urgent', 'Routine'], description: 'Classify the urgency.' },
                    symptomSummary: { type: Type.STRING, description: 'A paragraph summarizing the key symptoms.' },
                    recommendedAction: { type: Type.STRING, description: 'The suggested next step for the user.' },
                    generatedReport: { type: Type.STRING, description: 'A detailed medical report in Markdown format. Include sections for "Symptom Analysis", "Potential Causes (General Information Only)", and a "Referrals & Next Steps" section based on the referrals array.' },
                    referrals: {
                        type: Type.ARRAY,
                        description: 'A list of recommended referrals to entities from the provided lists.',
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: ['Doctor', 'Hospital', 'Lab'] },
                                name: { type: Type.STRING, description: 'The exact name of the referred entity.'},
                                id: { type: Type.INTEGER, description: 'The exact ID of the referred entity from the provided lists.' },
                                reason: { type: Type.STRING, description: 'A brief reason for the referral, e.g., "Consultation for chest pain"' }
                            },
                            required: ['type', 'name', 'id', 'reason']
                        }
                    }
                },
                required: ['triageLevel', 'symptomSummary', 'recommendedAction', 'generatedReport', 'referrals']
            }
          }
        });
        
        const reportData = JSON.parse(response.text);
        setFinalReport({...reportData, fullConversation: fullHistory});
        setStep(3); // Move to report view

      } else {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Continue the conversation based on this history: \n\n${fullHistory.map(m => `${m.role}: ${m.text}`).join('\n')}`,
            config: {
              systemInstruction: "You are an AI Triage Assistant. Your goal is to ask clarifying questions about a user's symptoms to determine urgency. Ask about duration, severity (on a scale of 1-10), and related symptoms. Keep questions concise. When the user indicates they are done providing information (e.g., by saying 'that's all'), end your response with just 'Understood. I am now analyzing this information.'",
            },
          });
        const modelMessage: ChatMessage = { role: 'model', text: response.text };
        setMessages(prev => [...prev, modelMessage]);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage: ChatMessage = { role: 'model', text: "I'm sorry, I encountered an error. Please consult a medical professional directly." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
      <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && <HeartPulseIcon className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />}
        <div className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-md ${isUser ? 'bg-sky-500 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        </div>
         {isUser && <UserCircleIcon className="w-8 h-8 text-slate-400 flex-shrink-0" />}
      </div>
    );
  };
  
  const TriageLevelIndicator: React.FC<{ level: 'Emergency' | 'Urgent' | 'Routine' }> = ({ level }) => {
      const levelInfo = {
          Emergency: { color: 'bg-red-500', text: 'Seek Immediate Care' },
          Urgent: { color: 'bg-amber-500', text: 'See a Doctor Soon' },
          Routine: { color: 'bg-sky-500', text: 'Book a Routine Visit' },
      };
      return (
          <div className={`p-4 rounded-lg ${levelInfo[level].color} text-white text-center`}>
              <p className="font-bold text-lg">{level}</p>
              <p>{levelInfo[level].text}</p>
          </div>
      )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in-up">
      <div className="w-full max-w-2xl h-[90vh] max-h-[800px] bg-slate-50 rounded-lg shadow-2xl flex flex-col">
        <header className="bg-red-600 text-white p-4 flex justify-between items-center rounded-t-lg">
          <h3 className="font-bold text-lg">AI Triage Assistant</h3>
          <button onClick={onClose} aria-label="Close">
            <CloseIcon className="h-6 w-6" />
          </button>
        </header>

        {/* Progress Bar */}
        <div className="p-4 bg-white border-b border-slate-200">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span className={step >= 1 ? 'text-sky-600' : ''}>1. Symptoms</span>
                <span className={step >= 2 ? 'text-sky-600' : ''}>2. Analysis</span>
                <span className={step >= 3 ? 'text-sky-600' : ''}>3. Report</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                <div className="bg-sky-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
        </div>
        
        <main className="flex-1 p-4 overflow-y-auto">
            {step < 3 && (
                <div ref={chatContainerRef}>
                    {messages.map((msg, index) => <MessageBubble key={index} message={msg} />)}
                    {isLoading && (
                        <div className="flex justify-start gap-3 my-4">
                            <HeartPulseIcon className="w-8 h-8 text-red-500 flex-shrink-0" />
                            <div className="px-4 py-3 bg-slate-200 rounded-2xl rounded-bl-none flex items-center gap-2">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-300"></span>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {step === 3 && finalReport && (
                <div className="p-4 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Triage Analysis Complete</h2>
                    <TriageLevelIndicator level={finalReport.triageLevel} />
                    <div className="mt-4">
                        <h3 className="font-semibold text-slate-700">Symptom Summary</h3>
                        <p className="text-sm text-slate-600">{finalReport.symptomSummary}</p>
                    </div>
                    <div className="mt-4">
                        <h3 className="font-semibold text-slate-700">Recommended Action</h3>
                        <p className="text-sm text-slate-600">{finalReport.recommendedAction}</p>
                    </div>
                </div>
            )}
            {step === 4 && (
                <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                    <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800">Success!</h2>
                    <p className="text-slate-600">Your Triage Report and Virtual Card have been saved to your Patient Records.</p>
                </div>
            )}
        </main>

        <footer className="p-4 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
            {step < 3 && (
                <>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-3 rounded-md mb-3 text-xs">
                        <p><ExclamationTriangleIcon className="h-5 w-5 inline-block mr-2" />This is not a medical diagnosis. For emergencies, call 911. For any health concerns, consult a doctor.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="text" value={input} onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
                            placeholder={isListening ? "Listening..." : "Describe your symptoms..."}
                            className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white text-slate-800"
                            disabled={isLoading || isListening}
                        />
                        {isSpeechRecognitionSupported && (
                            <button
                                onClick={handleToggleListening} disabled={isLoading}
                                className={`p-3 rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                            >
                                <MicrophoneOnIcon className="h-5 w-5" />
                            </button>
                        )}
                        <button
                            onClick={() => handleSend(input)} disabled={isLoading || !input.trim()}
                            className="p-3 bg-red-600 text-white rounded-lg disabled:bg-slate-400 hover:bg-red-700 transition"
                            aria-label="Send message"
                        >
                            <SendIcon className="h-5 w-5" />
                        </button>
                    </div>
                </>
            )}
            {step === 3 && (
                 <div className="flex justify-end gap-3">
                     <button onClick={() => { onComplete(finalReport); setStep(4); }} className="px-5 py-2 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2">
                         <DocumentTextIcon className="h-5 w-5" />
                         Save Report & Card
                     </button>
                 </div>
            )}
            {step === 4 && (
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors">Close</button>
                </div>
            )}
        </footer>
      </div>
    </div>
  );
};

export default AITriageAssistant;