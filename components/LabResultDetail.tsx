import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { LabResultReport } from '../types';
import { CloseIcon, LightBulbIcon } from './IconComponents';

interface LabResultDetailProps {
  result: LabResultReport;
  onClose: () => void;
}

const MetricRow: React.FC<{ metric: LabResultReport['metrics'][0] }> = ({ metric }) => {
    const getStatusColor = () => {
        switch (metric.status) {
            case 'High':
            case 'Low':
            case 'Abnormal':
                return 'text-red-600 font-bold';
            default:
                return 'text-slate-800';
        }
    };

    const getStatusIndicator = () => {
        switch (metric.status) {
            case 'High': return <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">High</span>;
            case 'Low': return <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Low</span>;
            case 'Abnormal': return <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Abnormal</span>;
            default: return <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Normal</span>;
        }
    };

    return (
        <tr className="border-b border-slate-200 last:border-b-0">
            <td className="py-3 px-4 text-sm font-medium text-slate-600">{metric.name}</td>
            <td className={`py-3 px-4 text-sm text-center ${getStatusColor()}`}>{metric.value} {metric.unit}</td>
            <td className="py-3 px-4 text-sm text-slate-500 text-center">{metric.referenceRange}</td>
            <td className="py-3 px-4 text-center">{getStatusIndicator()}</td>
        </tr>
    );
};

const LabResultDetail: React.FC<LabResultDetailProps> = ({ result, onClose }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);

    const generateSummary = async () => {
      if (result.metrics.length === 0) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `You are a helpful medical assistant AI. Your role is to explain lab results to a patient in simple, clear, and reassuring language. Do NOT provide a medical diagnosis or treatment advice. You must tell the user to consult their doctor for any medical advice. Here is the lab result data in JSON format: ${JSON.stringify(result.metrics)}. Please provide a summary that includes: 1. A brief explanation of what this test (${result.testName}) is for. 2. A summary of the key findings, highlighting any out-of-range values. 3. A concluding sentence reminding the user to discuss these results with their healthcare provider.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        setSummary(response.text);
      } catch (err) {
        console.error("Error generating lab result summary:", err);
        setError("Could not generate an AI summary at this time. Please review the results and consult your doctor.");
      } finally {
        setIsLoading(false);
      }
    };

    generateSummary();
    
    return () => window.removeEventListener('keydown', handleEsc);
  }, [result, onClose]);

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
            <h2 className="text-2xl font-bold text-slate-800">{result.testName}</h2>
            <p className="text-slate-500">Result Date: {new Date(result.date).toLocaleDateString()}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="Close lab result details"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </header>
        
        <main className="p-6 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Ordering Physician</h3>
            <p className="text-slate-600">{result.doctor.name}, {result.doctor.specialty}</p>
          </div>
          
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="py-2 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Test</th>
                  <th className="py-2 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</th>
                  <th className="py-2 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference Range</th>
                  <th className="py-2 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.metrics.map(metric => <MetricRow key={metric.name} metric={metric} />)}
              </tbody>
            </table>
          </div>
          
          {result.metrics.length > 0 && (
            <div className="mt-6 bg-sky-50 border-l-4 border-sky-400 p-5 rounded-r-lg">
              <h3 className="text-lg font-bold text-sky-800 mb-3 flex items-center gap-2">
                <LightBulbIcon className="h-6 w-6" />
                AI-Powered Summary
              </h3>
              {isLoading && (
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-sky-600 rounded-full animate-spin"></div>
                  <span>Generating explanation...</span>
                </div>
              )}
              {error && <p className="text-red-600 text-sm">{error}</p>}
              {summary && <p className="text-sky-800 leading-relaxed whitespace-pre-wrap">{summary}</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LabResultDetail;