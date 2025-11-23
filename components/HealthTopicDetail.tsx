import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { HealthTopic } from '../types';
import { CloseIcon, VideoCameraIcon } from './IconComponents';

interface HealthTopicDetailProps {
  topic: HealthTopic;
  onClose: () => void;
}

interface GeneratedContent {
    article: string;
    videoScript: string;
}

// Helper to parse a single line for bold text
const parseText = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);
    return (
        <React.Fragment>
            {parts.map((part, j) =>
                part.startsWith('**') && part.endsWith('**') ?
                <strong key={j} className="font-bold text-slate-700">{part.slice(2, -2)}</strong> :
                part
            )}
        </React.Fragment>
    );
};

const MarkdownRenderer: React.FC<{ markdown: string }> = ({ markdown }) => {
    const lines = markdown.split('\n');
    const components: React.ReactNode[] = [];
    let currentListItems: React.ReactNode[] = [];

    const flushList = () => {
        if (currentListItems.length > 0) {
            components.push(<ul key={`list-${components.length}`} className="list-disc pl-6 space-y-2 my-4">{currentListItems}</ul>);
            currentListItems = [];
        }
    };

    lines.forEach((line, i) => {
        if (line.startsWith('## ')) {
            flushList();
            components.push(<h2 key={i} className="text-2xl font-bold mt-6 mb-3 text-slate-800">{parseText(line.substring(3))}</h2>);
        } else if (line.startsWith('### ')) {
            flushList();
            components.push(<h3 key={i} className="text-xl font-semibold mt-4 mb-2 text-slate-700">{parseText(line.substring(4))}</h3>);
        } else if (line.startsWith('* ') || line.startsWith('- ')) {
            currentListItems.push(<li key={i}>{parseText(line.substring(2))}</li>);
        } else if (line.trim() !== '') {
            flushList();
            components.push(<p key={i} className="mb-4">{parseText(line)}</p>);
        } else {
            // It's a blank line, which can act as a separator.
            flushList();
        }
    });

    flushList(); // Add any remaining list items at the end

    return (
        <div className="prose max-w-none text-slate-600 leading-relaxed">
            {components}
        </div>
    );
};


const HealthTopicDetail: React.FC<HealthTopicDetailProps> = ({ topic, onClose }) => {
    const [content, setContent] = useState<GeneratedContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const generateContent = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Generate an engaging article about '${topic.title}'. Return a JSON object with two keys: "article" (the full article text in Markdown format, with headings and lists) and "videoScript" (a short, friendly script for a 30-second explanatory video on the topic).`,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                          type: Type.OBJECT,
                          properties: {
                            article: { type: Type.STRING, description: 'The full article content in Markdown format.' },
                            videoScript: { type: Type.STRING, description: 'A short script for an explanatory video.' }
                          }
                        }
                    }
                });

                const jsonResponse = JSON.parse(response.text);
                setContent(jsonResponse);

            } catch (err) {
                console.error("Error generating health topic content:", err);
                setError("Sorry, we couldn't generate the content for this topic right now. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        generateContent();
    }, [topic]);
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-5 border-b border-slate-200 flex justify-between items-start gap-4">
                    <div>
                        <p className="text-sm font-semibold text-sky-600 uppercase">{topic.category}</p>
                        <h2 className="text-2xl font-bold text-slate-800">{topic.title}</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0"
                        aria-label="Close topic details"
                    >
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </header>
                
                <main className="p-6 overflow-y-auto">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-96">
                            <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
                            <p className="mt-4 text-slate-500 font-semibold">Generating your health guide...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center h-96 flex flex-col justify-center items-center text-red-600 bg-red-50 p-6 rounded-lg">
                            <p className="font-semibold">An Error Occurred</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {content && (
                        <div>
                            <MarkdownRenderer markdown={content.article} />
                            <div className="mt-8 bg-sky-50 border-l-4 border-sky-400 p-6 rounded-r-lg">
                                <h3 className="text-lg font-bold text-sky-800 mb-3 flex items-center gap-2">
                                    <VideoCameraIcon className="h-6 w-6" />
                                    30-Second Video Idea
                                </h3>
                                <p className="text-sky-700 italic whitespace-pre-wrap font-mono text-sm">{content.videoScript}</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default HealthTopicDetail;