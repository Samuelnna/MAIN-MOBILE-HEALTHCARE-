
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Medication, Reminder } from '../types';
import { CloseIcon, PlusIcon, TrashIcon, SparklesIcon, LightBulbIcon, CalendarIcon } from './IconComponents';

interface ReminderModalProps {
  medication: Medication;
  onClose: () => void;
  onSave: (reminders: Reminder[], schedule?: { frequency?: string, startDate?: string, endDate?: string, duration?: string }) => void;
}

interface Suggestion {
    time: string;
    dosageNote: string;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ medication, onClose, onSave }) => {
  const [reminders, setReminders] = useState<Reminder[]>(medication.reminders || []);
  const [newTime, setNewTime] = useState('08:00');
  const [newDosageNote, setNewDosageNote] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [keyTip, setKeyTip] = useState<string | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // Schedule fields
  const [frequency, setFrequency] = useState(medication.frequency || '');
  const [startDate, setStartDate] = useState(medication.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(medication.endDate || '');
  const [duration, setDuration] = useState(medication.duration || '');

  useEffect(() => {
    const fetchSuggestions = async () => {
        setIsLoadingSuggestions(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Based on the medication "${medication.name}" with instructions "${medication.usageInstructions}", generate a JSON object. This object should contain:
                1. A "suggestions" key: an array of up to 3 objects, each with a "time" (e.g., "08:00 AM") and a "dosageNote" (e.g., "Take 1 tablet with food").
                2. A "keyTip" key: a single string with a crucial, user-friendly piece of advice for taking this medication.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            suggestions: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        time: { type: Type.STRING },
                                        dosageNote: { type: Type.STRING }
                                    },
                                    required: ['time', 'dosageNote']
                                }
                            },
                            keyTip: { type: Type.STRING }
                        },
                         required: ['suggestions', 'keyTip']
                    }
                }
            });
            const parsedResponse = JSON.parse(response.text);
            if (parsedResponse.suggestions) {
                setSuggestions(parsedResponse.suggestions);
            }
            if(parsedResponse.keyTip){
                setKeyTip(parsedResponse.keyTip);
            }
        } catch (error) {
            console.error("Error fetching reminder suggestions:", error);
            // Fallback suggestions
            setSuggestions([
                { time: '08:00 AM', dosageNote: 'Take with breakfast' },
                { time: '06:00 PM', dosageNote: 'Take with dinner' }
            ]);
            setKeyTip("Always take medication as prescribed by your doctor.");
        } finally {
            setIsLoadingSuggestions(false);
        }
    };
    fetchSuggestions();
  }, [medication]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);
  
  // Auto-calculate duration when dates change
  useEffect(() => {
      if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (!isNaN(diffDays) && diffDays >= 0) {
              setDuration(`${diffDays + 1} days`);
          }
      }
  }, [startDate, endDate]);

  const addReminder = (time: string, note = '') => {
    if (time && !reminders.some(r => r.time === time)) {
        const newReminder: Reminder = {
            id: `rem-${Date.now()}`,
            time: time,
            dosageNote: note
        };
      const sortedReminders = [...reminders, newReminder].sort((a, b) => a.time.localeCompare(b.time, undefined, { numeric: true }));
      setReminders(sortedReminders);
    }
  };

  const handleManualAdd = () => {
    const formattedTime = formatTime(newTime);
    addReminder(formattedTime, newDosageNote);
    setNewDosageNote('');
  };

  const removeReminder = (idToRemove: string) => {
    setReminders(reminders.filter(r => r.id !== idToRemove));
  };
  
  const handleNoteChange = (id: string, note: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, dosageNote: note } : r));
  };
  
  const handleSave = () => {
      const schedule = {
          frequency,
          startDate,
          endDate,
          duration
      };
      onSave(reminders, schedule);
      onClose();
  }

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${String(formattedHour).padStart(2, '0')}:${minute} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
        <header className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Set Reminders & Schedule</h2>
            <p className="text-slate-500">for {medication.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
            <CloseIcon className="h-6 w-6" />
          </button>
        </header>

        <main className="p-6 max-h-[65vh] overflow-y-auto">
            {/* Schedule Section */}
            <div className="mb-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-slate-500" /> Duration & Frequency</h3>
                
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Frequency</label>
                    <input 
                        type="text"
                        value={frequency}
                        onChange={e => setFrequency(e.target.value)}
                        placeholder="e.g. Twice daily, Every 8 hours"
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div>
                         <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
                         <input 
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 text-sm"
                         />
                    </div>
                    <div>
                         <label className="block text-xs font-semibold text-slate-500 mb-1">End Date</label>
                         <input 
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 text-sm"
                         />
                    </div>
                </div>
                
                <div>
                     <label className="block text-xs font-semibold text-slate-500 mb-1">Duration</label>
                     <input 
                        type="text"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        placeholder="e.g. 10 days"
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 text-sm bg-slate-50"
                     />
                </div>
            </div>

          <div className="bg-sky-50 border-l-4 border-sky-400 p-4 rounded-r-lg mb-6">
              <h3 className="text-sm font-bold text-sky-800 flex items-center gap-2"><SparklesIcon className="h-5 w-5" /> AI Suggestions</h3>
              {isLoadingSuggestions ? <p className="text-xs text-sky-700 mt-1">Generating suggestions...</p> : (
                  <div className="flex flex-wrap gap-2 mt-2">
                      {suggestions.map(sugg => (
                          <button key={sugg.time} onClick={() => addReminder(sugg.time, sugg.dosageNote)} className="px-3 py-1 bg-sky-200 text-sky-800 text-xs font-semibold rounded-full hover:bg-sky-300 transition-colors">
                              + Add {sugg.time}
                          </button>
                      ))}
                  </div>
              )}
          </div>
          
          <div className="space-y-3 mb-6">
            {reminders.length > 0 ? (
              reminders.map(rem => (
                <div key={rem.id} className="bg-slate-100 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-lg">{rem.time}</span>
                    <button onClick={() => removeReminder(rem.id)} className="p-1 text-red-500 hover:text-red-700">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={rem.dosageNote}
                    onChange={(e) => handleNoteChange(rem.id, e.target.value)}
                    placeholder="Add dosage note (e.g., '2 tablets with food')"
                    className="w-full text-sm p-2 mt-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-sky-500 bg-white"
                  />
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">No reminders set. Use suggestions or add one manually.</p>
            )}
          </div>

           <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Add Manually</label>
                <div className="flex items-center gap-2">
                    <input 
                        type="time" 
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                    <button 
                        onClick={handleManualAdd} 
                        className="p-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                        aria-label="Add reminder time"
                    >
                        <PlusIcon className="h-5 w-5" />
                    </button>
                </div>
                <input 
                    type="text"
                    value={newDosageNote}
                    onChange={(e) => setNewDosageNote(e.target.value)}
                    placeholder="Optional: dosage note for new time"
                    className="w-full text-sm p-2 mt-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500"
                  />
            </div>
             {keyTip && !isLoadingSuggestions && (
                <div className="mt-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                    <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                        <LightBulbIcon className="h-5 w-5" />
                        Key Tip
                    </h3>
                    <p className="text-xs text-amber-700 mt-1">{keyTip}</p>
                </div>
             )}
        </main>

        <footer className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600">Save Schedule</button>
        </footer>
      </div>
    </div>
  );
};

export default ReminderModal;
