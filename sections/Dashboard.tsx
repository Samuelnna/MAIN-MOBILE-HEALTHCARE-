
import React from 'react';
import type { Section, User } from '../types';
import FeatureCard from '../components/FeatureCard';
import { HospitalIcon, DoctorIcon, LabIcon, PharmacyIcon, CalendarIcon, MessageIcon, HeartPulseIcon, HeartIcon, ClipboardDocumentListIcon, SparklesIcon, CheckCircleIcon } from '../components/IconComponents';
import HealthTopics from '../components/HealthTopics';

interface DashboardProps {
  user: User;
  setActiveSection: (section: Section) => void;
  openTriageBot: () => void;
  onOpenCreatePatient?: () => void;
  apiStatus?: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user, setActiveSection, openTriageBot, onOpenCreatePatient, apiStatus }) => {

  return (
    <>
      <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center overflow-hidden">
          {apiStatus && (
             <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full mb-6 text-sm font-medium animate-fade-in-up">
                <CheckCircleIcon className="h-4 w-4" />
                API Connection: {apiStatus}
             </div>
          )}
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Welcome back, <span className="text-sky-600">{user.name.split(' ')[0]}</span>
            <span className="animate-wave ml-2" style={{ animationDelay: '500ms' }}>👋</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            Access top-tier medical services from the comfort of your home. Find hospitals, consult with doctors, get lab tests, and manage prescriptions—all in one place.
          </p>

          <button 
            onClick={() => setActiveSection('Appointments')}
            className="mt-8 px-8 py-3 bg-teal-500 text-white font-bold rounded-full hover:bg-teal-600 transition-colors duration-300 transform hover:scale-105 animate-fade-in-up"
            style={{ animationDelay: '500ms' }}
          >
            My Appointments
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {user.userType === 'professional' && onOpenCreatePatient && (
            <FeatureCard
              icon={<SparklesIcon className="h-10 w-10" />}
              title="AI Patient Intake"
              description="Instantly create a new patient record from a description."
              onClick={onOpenCreatePatient}
            />
          )}
          <FeatureCard
            icon={<HeartPulseIcon className="h-10 w-10" />}
            title="AI Triage Assistant"
            description="Get an AI-powered triage, report, and virtual card for your symptoms."
            onClick={openTriageBot}
          />
          <FeatureCard
            icon={<ClipboardDocumentListIcon className="h-10 w-10" />}
            title="Patient Records"
            description="View your triage reports and virtual hospital cards."
            onClick={() => setActiveSection('Patient Records')}
          />
           <FeatureCard
            icon={<MessageIcon className="h-10 w-10" />}
            title="Messaging"
            description="Chat securely with your healthcare providers."
            onClick={() => setActiveSection('Messaging')}
          />
          <FeatureCard
            icon={<CalendarIcon className="h-10 w-10" />}
            title="Appointments"
            description="Manage your upcoming and past appointments."
            onClick={() => setActiveSection('Appointments')}
          />
          <FeatureCard
            icon={<HospitalIcon className="h-10 w-10" />}
            title="Hospitals"
            description="Find accredited hospitals and their services."
            onClick={() => setActiveSection('Hospitals')}
          />
          <FeatureCard
            icon={<DoctorIcon className="h-10 w-10" />}
            title="Doctors"
            description="Consult with specialists across various fields."
            onClick={() => setActiveSection('Doctors')}
          />
           <FeatureCard
            icon={<HeartIcon className="h-10 w-10" />}
            title="Vitals Tracking"
            description="Connect a wearable device to monitor your health."
            onClick={() => setActiveSection('Vitals')}
          />
          <FeatureCard
            icon={<LabIcon className="h-10 w-10" />}
            title="Lab & Tests"
            description="Schedule lab tests and view your reports online."
            onClick={() => setActiveSection('Labs')}
          />
          <FeatureCard
            icon={<PharmacyIcon className="h-10 w-10" />}
            title="Pharmacy"
            description="Order prescriptions and wellness products."
            onClick={() => setActiveSection('Pharmacy')}
          />
        </div>
      </div>

      <HealthTopics />
    </>
  );
};

export default Dashboard;
