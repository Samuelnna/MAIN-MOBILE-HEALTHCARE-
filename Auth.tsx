
import React, { useState } from 'react';
import { HospitalIcon, SparklesIcon, ArrowLeftIcon } from './components/IconComponents';
import type { User } from './types';
import ProfessionalSignUp from './components/ProfessionalSignUp';
import { api } from './services/api';
import { useNotification } from './contexts/NotificationContext';

interface AuthProps {
  onLogin: (user: User, isSignUp: boolean) => void;
  onProfessionalSignUp: (user: User, details: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onProfessionalSignUp }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [userType, setUserType] = useState<'patient' | 'professional'>('patient');
  const [showProfessionalSignUp, setShowProfessionalSignUp] = useState(false);
  const [isAIView, setIsAIView] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // State for controlled inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Store user data before proceeding to the professional-specific step
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const { addNotification } = useNotification();

  const handleAuthAction = () => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: fullName,
      email: email,
      hospitalId: `MH-${Math.floor(10000000 + Math.random() * 90000000)}`,
      userType: userType,
    };

    if (authMode === 'signup' && userType === 'professional') {
      setPendingUser(newUser);
      setShowProfessionalSignUp(true);
    } else {
      // For sign-in or patient sign-up, log in directly
      onLogin(newUser, authMode === 'signup');
    }
  };

  const handleAIRegister = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const result = await api.createAIPatient(aiPrompt);
      console.log('AI Patient Creation Result:', result);

      if (result && result.status === true) {
        addNotification('Registration Successful', `AI Patient created successfully! ID: ${result.id}`, 'success');
        setAiPrompt('');
        setIsAIView(false);
        setAuthMode('signin');
      } else {
        addNotification('Registration Failed', 'Could not create patient profile via AI. Please try again.', 'error');
      }
    } catch (error) {
       console.error('AI Register Error:', error);
       addNotification('Error', 'Failed to connect to AI service.', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };
  
  if (showProfessionalSignUp) {
    return <ProfessionalSignUp 
      user={pendingUser!}
      onComplete={onProfessionalSignUp} 
      onBack={() => setShowProfessionalSignUp(false)} 
    />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        <div className="flex justify-center items-center gap-3 mb-6">
          <HospitalIcon className="h-10 w-10 text-sky-600" />
          <h1 className="text-3xl font-bold text-slate-800">Mobile Health</h1>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg transition-all duration-300">
          
          {!isAIView ? (
            <>
              <div className="mb-6">
                <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-50">
                  <button
                    onClick={() => setUserType('patient')}
                    className={`w-1/2 py-2 rounded-md font-semibold text-sm transition-all ${userType === 'patient' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Patient
                  </button>
                  <button
                    onClick={() => setUserType('professional')}
                    className={`w-1/2 py-2 rounded-md font-semibold text-sm transition-all ${userType === 'professional' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Professional
                  </button>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center text-slate-700 mb-6">
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </h2>

              {/* AI Quick Register Promo */}
              {authMode === 'signup' && userType === 'patient' && (
                 <div 
                    onClick={() => setIsAIView(true)}
                    className="mb-6 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white cursor-pointer hover:shadow-md transition-transform transform hover:-translate-y-0.5 flex items-center justify-between group"
                 >
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                             <SparklesIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">AI Quick Register</p>
                            <p className="text-xs text-indigo-100">Create profile from description</p>
                        </div>
                    </div>
                    <div className="bg-white/20 px-3 py-1 rounded text-xs font-bold group-hover:bg-white/30 transition-colors">
                        Try It
                    </div>
                 </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleAuthAction(); }} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
                {userType === 'professional' && authMode === 'signup' && (
                   <input
                    type="text"
                    placeholder="License Number"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                  />
                )}
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 transition-colors"
                >
                  {authMode === 'signin' ? 'Sign In' : (userType === 'patient' ? 'Sign Up' : 'Continue')}
                </button>
              </form>

              <div className="mt-6 text-center space-y-4">
                <button
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-sm text-sky-600 hover:underline font-medium"
                >
                  {authMode === 'signin'
                    ? "Don't have an account? Sign Up"
                    : 'Already have an account? Sign In'}
                </button>
              </div>
            </>
          ) : (
            // AI Registration View
            <div className="animate-fade-in">
                <button onClick={() => setIsAIView(false)} className="mb-4 text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm font-medium">
                    <ArrowLeftIcon className="h-4 w-4" /> Back to form
                </button>
                <div className="text-center mb-6">
                     <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <SparklesIcon className="h-6 w-6 text-indigo-600" />
                     </div>
                    <h2 className="text-xl font-bold text-slate-800">AI Patient Creation</h2>
                    <p className="text-sm text-slate-500 mt-1">Describe the patient profile to generate an account instantly.</p>
                </div>
                <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.g. Create a patient named Sarah Connor, 35 years old, living in Los Angeles, allergic to penicillin..."
                    rows={5}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4 text-sm"
                    disabled={isAiLoading}
                />
                <button
                    onClick={handleAIRegister}
                    disabled={isAiLoading || !aiPrompt.trim()}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isAiLoading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Creating...
                        </>
                    ) : (
                        <>Create Patient Profile</>
                    )}
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
