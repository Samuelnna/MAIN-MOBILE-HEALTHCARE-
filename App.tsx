
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './sections/Dashboard';
import Hospitals from './sections/Hospitals';
import Doctors from './sections/Doctors';
import Labs from './sections/Labs';
import Pharmacy from './sections/Pharmacy';
import Chatbot from './components/Chatbot';
import Auth from './Auth';
import Appointments from './sections/Appointments';
import Messaging from './sections/Messaging';
import AITriageAssistant from './components/TriageBot';
import CartSummary from './components/CartSummary';
import { requestNotificationPermission, showNotification } from './utils/notifications';
import { CartItem, Medication, User, Doctor, Section, Appointment, TriageReport, VirtualCard, LabAppointment, LabAppointmentCard, Referral, LabTest, Hospital, Reminder, Order, HospitalService, HospitalServiceAppointment, HospitalServiceAppointmentCard, MedicationRecord } from './types';
import HealthSummary from './sections/HealthSummary';
import Profile from './sections/Profile';
import VideoCall from './components/VideoCall';
import Vitals from './sections/Vitals';
import { mockAppointments } from './data/appointments';
import { useNotification } from './contexts/NotificationContext';
import PatientRecords from './sections/PatientRecords';
import CheckoutModal from './components/CheckoutModal';
import CreatePatientModal from './components/CreatePatientModal';
import { api } from './services/api';
import { mockDoctors } from './data/doctors';
import { mockHospitals } from './data/hospitals';
import { mockLabTests } from './data/labs';
import { mockMedications } from './data/pharmacy';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('Dashboard');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [myMedications, setMyMedications] = useState<Medication[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [videoCallParticipant, setVideoCallParticipant] = useState<{name: string; imageUrl: string} | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  
  // Professional features
  const [isCreatePatientOpen, setIsCreatePatientOpen] = useState(false);
  
  // Data States managed by API
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [pharmacyItems, setPharmacyItems] = useState<Medication[]>([]);
  const [medicationRecords, setMedicationRecords] = useState<MedicationRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [apiStatus, setApiStatus] = useState<string | null>(null);

  const [triageReports, setTriageReports] = useState<TriageReport[]>([]);
  const [virtualCards, setVirtualCards] = useState<VirtualCard[]>([]);
  const [labAppointments, setLabAppointments] = useState<LabAppointment[]>([]);
  const [labAppointmentCards, setLabAppointmentCards] = useState<LabAppointmentCard[]>([]);
  const [hospitalServiceAppointments, setHospitalServiceAppointments] = useState<HospitalServiceAppointment[]>([]);
  const [hospitalServiceAppointmentCards, setHospitalServiceAppointmentCards] = useState<HospitalServiceAppointmentCard[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const { addNotification } = useNotification();

  // Fetch initial data from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      
      // Helper to fetch with fallback so one failure doesn't break the app
      const fetchWithFallback = async <T,>(fetcher: () => Promise<T>, fallback: T, name: string): Promise<T> => {
        try {
          const data = await fetcher();
          console.log(`✅ Successfully fetched ${name} from API`);
          return data;
        } catch (error) {
          console.warn(`⚠️ Failed to fetch ${name}, falling back to mock data.`, error);
          return fallback;
        }
      };
      
      // Check system status
      const status = await api.getSystemStatus();
      setApiStatus(status);

      const [docResult, hospResult, labResult, medResult, apptResult, medRecordResult] = await Promise.all([
        fetchWithFallback(api.getDoctors, mockDoctors, 'Doctors'),
        fetchWithFallback(api.getHospitals, mockHospitals, 'Hospitals'),
        fetchWithFallback(api.getLabTests, mockLabTests, 'Lab Tests'),
        fetchWithFallback(api.getMedications, mockMedications, 'Medications'),
        fetchWithFallback(api.getAppointments, mockAppointments, 'Appointments'),
        fetchWithFallback(api.getPatientMedicationRecords, [], 'Patient Medications')
      ]);

      setDoctors(docResult);
      setHospitals(hospResult);
      setLabTests(labResult);
      setPharmacyItems(medResult);
      setAppointments(apptResult);
      setMedicationRecords(medRecordResult);

      setIsLoadingData(false);
    };

    loadData();
  }, [addNotification]);

  useEffect(() => {
    if (currentUser) {
      // Ask for notification permission once the user is logged in
      requestNotificationPermission();
    }
  }, [currentUser]);
  
  const handleLogin = (user: User, isSignUp: boolean) => {
    setCurrentUser({...user, imageUrl: user.imageUrl || undefined });
    if (isSignUp) {
      const welcomeMessage = `Welcome, ${user.name}! Your account is ready. You can now explore our services.`;
      addNotification(
        'Account Created Successfully!',
        welcomeMessage,
        'success'
      );
      showNotification('Welcome to Mobile Health!', {
        body: welcomeMessage,
        icon: '/vite.svg',
      });
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    addNotification('Profile Updated', 'Your changes have been saved successfully.', 'success');
  };

  const handleUpdateCart = (medication: Medication, quantity: number) => {
    setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === medication.id);
        if (quantity <= 0) {
            return prevItems.filter(item => item.id !== medication.id);
        }
        if (existingItem) {
            return prevItems.map(item => 
                item.id === medication.id ? { ...item, quantity } : item
            );
        }
        return [...prevItems, { ...medication, quantity }];
    });
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = (details: {
    deliveryMethod: 'Home Delivery' | 'In-Person Pickup';
    deliveryAddress?: string;
    pickupLocation?: string;
  }) => {
    if (cartItems.length === 0) return;

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        date: new Date().toISOString(),
        items: cartItems,
        total: total,
        status: details.deliveryMethod === 'Home Delivery' ? 'Processing' : 'Ready for Pickup',
        ...details,
    };

    setOrders(prev => [newOrder, ...prev]);

    setMyMedications(prevMeds => {
        const newMeds = [...prevMeds];
        cartItems.forEach(item => {
            if (!newMeds.some(med => med.id === item.id)) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { quantity, ...medication } = item;
                // Add dateAdded for tracking
                newMeds.push({ ...medication, dateAdded: new Date().toISOString().split('T')[0] });
            }
        });
        return newMeds;
    });

    addNotification('Order Successful!', `Your order #${newOrder.id.substring(4)} has been placed.`, 'success');
    setCartItems([]);
    setIsCheckoutOpen(false);
    setActiveSection('Patient Records');
  };

  const handleSetReminder = (medicationId: number, reminders: Reminder[], schedule?: { frequency?: string, startDate?: string, endDate?: string, duration?: string }) => {
    setMyMedications(prevMeds =>
        prevMeds.map(med =>
            med.id === medicationId ? { ...med, reminders, ...schedule } : med
        )
    );
    const medName = myMedications.find(m => m.id === medicationId)?.name;
    const reminderMessage = reminders.length > 0
        ? `Reminders and schedule updated for ${medName}.`
        : `Schedule updated for ${medName}.`;
        
    addNotification('Reminders Updated', reminderMessage, 'info');
  };

  const handleSaveTriageResult = (result: {
      triageLevel: 'Emergency' | 'Urgent' | 'Routine';
      symptomSummary: string;
      recommendedAction: string;
      generatedReport: string;
      referrals: Referral[];
      fullConversation: { role: 'user' | 'model', text: string }[];
  }) => {
      const now = new Date();
      const newReport: TriageReport = {
          id: `TR-${Date.now()}`,
          date: now.toISOString(),
          triageLevel: result.triageLevel,
          symptomSummary: result.symptomSummary,
          recommendedAction: result.recommendedAction,
          fullReport: result.generatedReport,
          referrals: result.referrals,
          conversation: result.fullConversation,
      };
      
      const firstReferral = result.referrals?.[0];
      let referralInfo: string | undefined;
      if (firstReferral) {
        let referredEntity: Doctor | Hospital | LabTest | undefined;
        if (firstReferral.type === 'Doctor') referredEntity = doctors.find(d => d.id === firstReferral.id);
        if (firstReferral.type === 'Hospital') referredEntity = hospitals.find(h => h.id === firstReferral.id);
        if (firstReferral.type === 'Lab') referredEntity = labTests.find(l => l.id === firstReferral.id);
        if(referredEntity) referralInfo = `Referred to: ${referredEntity.name}`;
      }

      const newCard: VirtualCard = {
          id: `VC-${Date.now()}`,
          patientName: currentUser!.name,
          patientId: currentUser!.hospitalId,
          triageLevel: result.triageLevel,
          chiefComplaint: result.symptomSummary.split('\n')[0],
          qrCodeData: `MH-TRIAGE:${newReport.id}`,
          issuedDate: now.toISOString(),
          referralInfo,
      };

      setTriageReports(prev => [newReport, ...prev]);
      setVirtualCards(prev => [newCard, ...prev]);

      addNotification('Report Generated', 'Triage report and virtual card saved to your Patient Records.', 'success');

      // Send notifications for each referral
      result.referrals.forEach((referral, index) => {
          setTimeout(() => { 
              addNotification(
                  `Referral Sent to ${referral.type}`,
                  `A referral to "${referral.name}" has been sent for: ${referral.reason}.`,
                  'info'
              );
          }, 500 * (index + 1));
      });
  };


  const handleBookAppointment = (details: {
    doctor: Doctor;
    date: string;
    time: string;
    type: 'Video Call' | 'Audio Call' | 'In-Person' | 'Messaging';
    reasonForVisit: string;
  }) => {
      const newAppointment: Appointment = {
          ...details,
          id: appointments.length + 1,
          status: 'Upcoming',
      };
      setAppointments(prev => [newAppointment, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      
      const notificationMessage = `Your ${details.type} with ${details.doctor.name} on ${details.date} at ${details.time} is booked.`;

      addNotification(
          'Appointment Confirmed!',
          notificationMessage,
          'success'
      );

      showNotification('Appointment Confirmed!', {
          body: notificationMessage,
          icon: '/vite.svg',
      });
  };
  
   const handleScheduleLabTest = (details: {
    test: LabTest;
    date: string;
    time: string;
    location: string;
  }) => {
    const newAppointment: LabAppointment = {
      id: `LA-${Date.now()}`,
      test: details.test,
      date: details.date,
      time: details.time,
      location: details.location,
      status: 'Upcoming',
    };

    const newCard: LabAppointmentCard = {
      id: `LC-${Date.now()}`,
      appointmentId: newAppointment.id,
      patientName: currentUser!.name,
      testName: details.test.name,
      date: details.date,
      time: details.time,
      location: details.location,
      qrCodeData: `MH-LAB:${newAppointment.id}`,
      preparationInstructions: details.test.requiresFasting ? 'Fasting is required for 8-12 hours before your test. Water is permitted.' : 'No special preparation needed.',
    };
    
    setLabAppointments(prev => [newAppointment, ...prev]);
    setLabAppointmentCards(prev => [newCard, ...prev]);

    const notificationMessage = `Your lab test for "${details.test.name}" is scheduled for ${new Date(details.date + 'T00:00:00').toLocaleDateString()} at ${details.time}.`;
    addNotification('Lab Test Scheduled!', notificationMessage, 'success');
  };

  const handleScheduleHospitalService = (details: {
    hospital: Hospital;
    service: HospitalService;
    date: string;
    time: string;
  }) => {
    const newAppointment: HospitalServiceAppointment = {
      id: `HSA-${Date.now()}`,
      hospital: details.hospital,
      service: details.service,
      date: details.date,
      time: details.time,
      status: 'Upcoming',
    };

    const newCard: HospitalServiceAppointmentCard = {
      id: `HSC-${Date.now()}`,
      appointmentId: newAppointment.id,
      patientName: currentUser!.name,
      hospitalName: details.hospital.name,
      serviceName: details.service.name,
      date: details.date,
      time: details.time,
      location: details.hospital.location,
      qrCodeData: `MH-SERVICE:${newAppointment.id}`,
      preparationInstructions: 'Please arrive 15 minutes early for your appointment.',
    };
    
    setHospitalServiceAppointments(prev => [newAppointment, ...prev]);
    setHospitalServiceAppointmentCards(prev => [newCard, ...prev]);

    const notificationMessage = `Your appointment for "${details.service.name}" at ${details.hospital.name} is scheduled for ${new Date(details.date + 'T00:00:00').toLocaleDateString()} at ${details.time}.`;
    addNotification('Service Scheduled!', notificationMessage, 'success');
    setActiveSection('Patient Records');
  };

  const handleStartVideoCall = (participant: {name: string; imageUrl: string}) => {
    setVideoCallParticipant(participant);
    setIsVideoCallActive(true);
  };

  const handleEndVideoCall = () => {
    setIsVideoCallActive(false);
    setVideoCallParticipant(null);
  };

  const handleProfessionalSignUp = (user: User, professionalDetails: {
    specialty: string;
    hospital: string;
    yearsOfExperience: string;
    consultationTypes: ('Video Call' | 'Audio Call' | 'In-Person' | 'Messaging')[];
    bio: string;
  }) => {
    const newDoctor: Doctor = {
      id: doctors.length + 1,
      name: `Dr. ${user.name}`,
      specialty: professionalDetails.specialty,
      hospital: professionalDetails.hospital,
      availability: ['Mon', 'Wed', 'Fri'], // Default availability
      imageUrl: `https://picsum.photos/seed/newdoc${doctors.length + 1}/400/400`,
      yearsOfExperience: parseInt(professionalDetails.yearsOfExperience, 10) || 0,
      bio: professionalDetails.bio,
      consultationTypes: professionalDetails.consultationTypes,
    };
    setDoctors(prevDoctors => [newDoctor, ...prevDoctors]);
    setCurrentUser({...user, imageUrl: newDoctor.imageUrl}); // Professionals get an image
    setActiveSection('Doctors'); // Navigate to doctors section to see the new profile
    const welcomeMessage = `Dr. ${user.name}, your professional profile is now active. Patients can now book appointments with you.`;
    addNotification(
      'Welcome to Mobile Health!', 
      welcomeMessage, 
      'success'
    );
    showNotification('Profile Activated!', {
        body: welcomeMessage,
        icon: '/vite.svg',
    });
  };

  const renderSection = () => {
    if (isLoadingData && ['Hospitals', 'Doctors', 'Labs', 'Pharmacy'].includes(activeSection)) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
           <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
           <p className="mt-4 text-slate-500 font-semibold">Loading latest data...</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'Hospitals':
        return <Hospitals hospitals={hospitals} onScheduleService={handleScheduleHospitalService} />;
      case 'Doctors':
        return <Doctors doctors={doctors} onBookAppointment={handleBookAppointment} onStartVideoCall={handleStartVideoCall} />;
      case 'Labs':
        return <Labs availableTests={labTests} appointments={labAppointments} cards={labAppointmentCards} onScheduleTest={handleScheduleLabTest} />;
      case 'Pharmacy':
        return <Pharmacy 
                    cartItems={cartItems} 
                    onUpdateCart={handleUpdateCart}
                    onProceedToCheckout={handleProceedToCheckout}
                    myMedications={myMedications}
                    onSetReminder={handleSetReminder}
                    pharmacyItems={pharmacyItems}
                    medicationRecords={medicationRecords}
                />;
      case 'Appointments':
        return <Appointments appointments={appointments} doctors={doctors} onStartVideoCall={handleStartVideoCall} onBookAppointment={handleBookAppointment} />;
      case 'Messaging':
        return <Messaging onStartVideoCall={handleStartVideoCall} />;
      case 'Health Summary':
        return <HealthSummary appointments={appointments} />;
      case 'Profile':
        return <Profile user={currentUser!} onUpdateUser={handleUpdateUser} />;
      case 'Patient Records':
        return <PatientRecords 
                    user={currentUser!}
                    reports={triageReports} 
                    cards={virtualCards} 
                    orders={orders}
                    doctors={doctors}
                    hospitals={hospitals}
                    labTests={labTests}
                    hospitalServiceCards={hospitalServiceAppointmentCards}
                    medicationRecords={medicationRecords}
                    purchasedMedications={myMedications}
                    setActiveSection={setActiveSection}
                />;
      case 'Vitals':
        return <Vitals />;
      case 'Dashboard':
      default:
        return <Dashboard 
                  user={currentUser!} 
                  setActiveSection={setActiveSection} 
                  openTriageBot={() => setIsAssistantOpen(true)} 
                  apiStatus={apiStatus} 
                  onOpenCreatePatient={() => setIsCreatePatientOpen(true)}
               />;
    }
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} onProfessionalSignUp={handleProfessionalSignUp} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      <Header 
        user={currentUser}
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        cartItems={cartItems}
        onCartClick={() => setIsCartOpen(true)}
        onOpenCreatePatient={() => setIsCreatePatientOpen(true)}
      />
      <main className="pt-20">
        {renderSection()}
      </main>
      <Chatbot />
      {isAssistantOpen && <AITriageAssistant 
                              onClose={() => setIsAssistantOpen(false)}
                              onComplete={(result) => {
                                handleSaveTriageResult(result);
                                setIsAssistantOpen(false);
                                setActiveSection('Patient Records');
                              }}
                           />}
      {isCreatePatientOpen && <CreatePatientModal onClose={() => setIsCreatePatientOpen(false)} />}
      <CartSummary 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateCart={handleUpdateCart}
        onProceedToCheckout={handleProceedToCheckout}
      />
      {isCheckoutOpen && (
        <CheckoutModal
          cartItems={cartItems}
          onClose={() => setIsCheckoutOpen(false)}
          onConfirm={handleConfirmOrder}
        />
      )}
      {isVideoCallActive && videoCallParticipant && (
        <VideoCall 
          participant={videoCallParticipant} 
          onEndCall={handleEndVideoCall}
        />
      )}
      <footer className="bg-slate-800 text-white p-4 text-center mt-12">
        <p>&copy; 2024 Mobile Health. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
