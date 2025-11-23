
import React, { useState, useRef, useEffect } from 'react';
import type { Conversation, ChatMessage } from '../types';
import { SendIcon, PhoneIcon, VideoCameraIcon, CheckCircleIcon } from '../components/IconComponents';
import { mockConversations, mockMessages } from '../data/messaging';
import { useNotification } from '../contexts/NotificationContext';

const TypingIndicator = () => (
    <div className="flex justify-start items-center gap-2 my-2">
        <div className="flex items-center gap-1.5 bg-white shadow-sm rounded-2xl rounded-bl-none px-4 py-3">
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></span>
        </div>
    </div>
);

interface MessagingProps {
  onStartVideoCall: (participant: { name: string; imageUrl: string }) => void;
}

const Messaging: React.FC<MessagingProps> = ({ onStartVideoCall }) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation>(mockConversations[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotification();

  useEffect(() => {
    setMessages(mockMessages[selectedConversation.id]?.map(m => ({...m, status: 'read'} as ChatMessage)) || []);
  }, [selectedConversation]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: inputText, status: 'sent', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');

    setTimeout(() => {
        setMessages(currentMessages => currentMessages.map(msg => 
            msg === userMessage ? { ...msg, status: 'read' } : msg
        ));
    }, 1200);

    setTimeout(() => setIsTyping(true), 1500);

    // Simulate a reply and notification
    setTimeout(() => {
        setIsTyping(false);
        const replyText = "Thank you for your message. I'm reviewing it now and will get back to you shortly.";
        const modelMessage: ChatMessage = { role: 'model', text: replyText, status: 'delivered', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, modelMessage]);

        addNotification(`New Message from ${selectedConversation.participant.name}`, replyText, 'info');
    }, 3500);
  };


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md h-[75vh] flex">
            {/* Conversation List */}
            <div className="w-1/3 border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h1 className="text-xl font-bold text-slate-800">Messages</h1>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {mockConversations.map(convo => (
                        <div key={convo.id} onClick={() => setSelectedConversation(convo)} className={`flex items-center p-4 cursor-pointer hover:bg-slate-50 ${selectedConversation.id === convo.id ? 'bg-sky-50' : ''}`}>
                            <img src={convo.participant.imageUrl} alt={convo.participant.name} className="w-12 h-12 rounded-full object-cover mr-4"/>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800">{convo.participant.name}</h3>
                                    <p className="text-xs text-slate-400 flex-shrink-0 ml-2">{convo.timestamp}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-slate-500 truncate">{convo.lastMessage}</p>
                                    {convo.unreadCount > 0 && <span className="bg-sky-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 ml-2">{convo.unreadCount}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Chat Window */}
            <div className="w-2/3 flex flex-col">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                            <div className="flex items-center">
                                <img src={selectedConversation.participant.imageUrl} alt={selectedConversation.participant.name} className="w-10 h-10 rounded-full object-cover mr-3"/>
                                <div>
                                    <h2 className="font-bold text-slate-800">{selectedConversation.participant.name}</h2>
                                    <div className="text-xs text-green-500 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full"></span>Online</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => alert(`Starting audio call with ${selectedConversation.participant.name}... (This is a placeholder)`)} className="text-slate-500 hover:text-sky-600"><PhoneIcon className="h-6 w-6" /></button>
                                <button onClick={() => onStartVideoCall(selectedConversation.participant)} className="text-slate-500 hover:text-sky-600"><VideoCameraIcon className="h-6 w-6" /></button>
                            </div>
                        </div>
                        <div 
                            className="flex-1 p-6 overflow-y-auto"
                            style={{
                                backgroundColor: '#f0f4f8',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dbeafe' fill-opacity='0.5' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
                            }}
                        >
                             {messages.map((msg, index) => (
                                <div key={index} className={`flex flex-col my-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-4 py-2 rounded-2xl max-w-lg ${msg.role === 'user' ? 'bg-sky-500 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none shadow-sm'}`}>
                                        <p>{msg.text}</p>
                                    </div>
                                    {msg.role === 'user' && msg.status && (
                                        <div className="flex items-center gap-1 mt-1.5">
                                            <span className="text-xs text-slate-400">{msg.timestamp}</span>
                                            <CheckCircleIcon className={`w-4 h-4 ${msg.status === 'read' ? 'text-blue-500' : 'text-slate-400'}`} />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isTyping && <TypingIndicator />}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-4 bg-white border-t border-slate-200">
                             <div className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Type a message..." 
                                    className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white text-slate-800"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button onClick={handleSendMessage} className="p-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"><SendIcon className="h-5 w-5" /></button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex justify-center items-center text-slate-500">Select a conversation to start messaging.</div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Messaging;
