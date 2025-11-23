
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CloseIcon, UploadIcon, ExclamationTriangleIcon, CameraIcon, SparklesIcon } from './IconComponents';

interface PillIdentifierModalProps {
  onClose: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const MarkdownRenderer: React.FC<{ markdown: string }> = ({ markdown }) => {
    const lines = markdown.split('\n');
    return (
        <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
            {lines.map((line, i) => {
                if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-lg font-semibold text-slate-800 mt-4 mb-2">{line.substring(4)}</h3>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-xl font-bold text-slate-900 mt-6 mb-3">{line.substring(3)}</h2>;
                }
                if (line.startsWith('* ')) {
                    return <li key={i} className="ml-4 list-disc">{line.substring(2)}</li>;
                }
                if (line.trim() === '') {
                    return <br key={i} />;
                }
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                    <p key={i} className="mb-2">
                        {parts.map((part, j) =>
                            part.startsWith('**') && part.endsWith('**') ?
                            <strong key={j} className="font-bold">{part.slice(2, -2)}</strong> :
                            part
                        )}
                    </p>
                );
            })}
        </div>
    );
};


const PillIdentifierModal: React.FC<PillIdentifierModalProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAnalysis(null);
      setError(null);
    }
  };
  
  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
        const base64Data = await fileToBase64(file);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const imagePart = {
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        };

        const textPart = {
          text: `You are a helpful AI Pill Identifier assistant. Analyze the image of the pill provided. Identify it based on its imprint, color, and shape.
          Your response must be in Markdown format. Provide the following information:
          1. A main heading "Pill Identification".
          2. The most likely **Drug Name** (e.g., Ibuprofen).
          3. Its **Primary Use** (e.g., Used to treat pain and fever).
          4. A **Description** of the pill's appearance (color, shape, imprint).
          5. A crucial **Disclaimer** sub-heading that states: "This information is AI-generated and for informational purposes only. It is not a substitute for professional medical advice. Always confirm with a licensed pharmacist or doctor before taking any medication."`
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        setAnalysis(response.text);

    } catch (err) {
      console.error("Error analyzing pill image:", err);
      setError("The AI could not identify this pill. The image may be unclear or the pill may not be in the database. Please consult a pharmacist.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
  };
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 h-64">
                <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mb-4"></div>
                <p className="font-semibold text-slate-700">AI is analyzing the image...</p>
                <p className="text-sm text-slate-500">This may take a moment.</p>
            </div>
        )
    }

    if (error) {
        return (
             <div className="text-center p-8 h-64 flex flex-col justify-center items-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mb-4" />
                <p className="font-semibold text-red-700">Identification Failed</p>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <button onClick={handleReset} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors">Try Again</button>
            </div>
        )
    }

    if (analysis) {
        return (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <img src={preview!} alt="Pill preview" className="w-full h-auto rounded-lg shadow-sm object-contain max-h-64"/>
                <div>
                    <MarkdownRenderer markdown={analysis} />
                </div>
            </div>
        )
    }
    
    if (preview) {
        return (
            <div className="p-6 text-center">
                <img src={preview} alt="Pill preview" className="max-h-48 w-auto mx-auto rounded-lg shadow-sm mb-4"/>
                 <div className="flex justify-center items-center gap-4">
                     <button onClick={handleReset} className="text-sm font-semibold text-slate-600 hover:text-slate-800">Clear</button>
                    <button onClick={handleAnalyze} className="px-6 py-2 bg-sky-600 text-white font-bold rounded-full hover:bg-sky-700 transition-colors">Identify Pill</button>
                 </div>
            </div>
        )
    }

    return (
      <div className="p-6">
        <label htmlFor="file-upload" className="relative block w-full h-64 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-sky-500 hover:bg-sky-50 transition-colors">
            <div className="flex flex-col items-center justify-center h-full text-center">
                <CameraIcon className="h-12 w-12 text-slate-400 mb-2"/>
                <p className="font-semibold text-slate-700">Upload Photo of Pill</p>
                <p className="text-sm text-slate-500">Take a photo or select an image file</p>
            </div>
            <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
        </label>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-5 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-7 w-7 text-sky-500" />
            <h2 className="text-xl font-bold text-slate-800">AI Pill Identifier</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors" aria-label="Close">
            <CloseIcon className="h-6 w-6" />
          </button>
        </header>
        
        <main className="overflow-y-auto">
          {renderContent()}
        </main>

        {(analysis || error) && (
             <footer className="p-4 border-t border-slate-200 bg-slate-50 text-right flex-shrink-0">
                <button onClick={handleReset} className="px-5 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors">Identify Another Pill</button>
            </footer>
        )}
      </div>
    </div>
  );
};

export default PillIdentifierModal;
