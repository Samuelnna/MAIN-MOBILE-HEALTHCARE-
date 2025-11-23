
import React, { useState, useMemo } from 'react';
import type { Appointment, Doctor } from '../types';
import { CalendarIcon, VideoCameraIcon, PhoneIcon, MessageIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from '../components/IconComponents';
import { useNotification } from '../contexts/NotificationContext';
import { api } from '../services/api';

interface AppointmentCardProps {
  appointment: Appointment;
  onStartVideoCall: (participant: { name: string; imageUrl: string }) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onStartVideoCall }) => {
  const [isReminderSet, setIsReminderSet] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [details, setDetails] = useState<Appointment | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const { addNotification } = useNotification();
  
  // Use the fetched details if available, otherwise use the prop
  const currentAppointment = details || appointment;
  
  const isUpcoming = currentAppointment.status === 'Upcoming';
  const cardColor = isUpcoming ? 'bg-white' : 'bg-slate-50';
  const textColor = isUpcoming ? 'text-slate-800' : 'text-slate-500';

  const handleSetReminder = (e: React.MouseEvent) => {
    e.stopPropagation();
    addNotification('Reminder Set', `We will notify you before your ${currentAppointment.type} with ${currentAppointment.doctor.name}.`, 'info');
    setIsReminderSet(true);
  }
  
  const toggleExpand = async () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    
    // Fetch fresh details when expanding to ensure summary/notes are up to date from API
    if (nextState && !details) {
        setIsLoadingDetails(true);
        try {
            const freshData = await api.getAppointmentById(appointment.id);
            if (freshData) {
                setDetails(freshData);
            }
        } catch (err) {
            console.error("Could not load appointment details", err);
        } finally {
            setIsLoadingDetails(false);
        }
    }
  };

  const getStatusChip = () => {
    switch (currentAppointment.status) {
        case 'Upcoming':
            return <div className="text-xs font-semibold bg-sky-100 text-sky-800 px-2 py-1 rounded-full">{currentAppointment.status}</div>
        case 'Completed':
            return <div className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">{currentAppointment.status}</div>
        case 'Cancelled':
             return <div className="text-xs font-semibold bg-red-100 text-red-800 px-2 py-1 rounded-full">{currentAppointment.status}</div>
    }
  }

  const handleJoinCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentAppointment.type === 'Video Call') {
      onStartVideoCall({ name: currentAppointment.doctor.name, imageUrl: currentAppointment.doctor.imageUrl });
    } else if (currentAppointment.type === 'Messaging') {
        alert(`Opening chat with ${currentAppointment.doctor.name}... (This is a placeholder)`);
    } else {
      alert(`Starting ${currentAppointment.type} with ${currentAppointment.doctor.name}... (This is a placeholder)`);
    }
  };

  return (
    <div className={`${cardColor} rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg ${!isUpcoming && 'opacity-75'}`}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <img src={currentAppointment.doctor.imageUrl} alt={currentAppointment.doctor.name} className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 flex-shrink-0"/>
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className={`text-xl font-bold ${textColor}`}>{currentAppointment.doctor.name}</h3>
                    <p className={`text-sm ${isUpcoming ? 'text-sky-600' : 'text-slate-400'} font-semibold`}>{currentAppointment.doctor.specialty}</p>
                </div>
                {getStatusChip()}
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-sm text-slate-500 mt-4">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-slate-400" />
                    <span>{new Date(currentAppointment.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {currentAppointment.time}</span>
                </div>
                 <div className="flex items-center gap-2">
                    {currentAppointment.type === 'Video Call' && <VideoCameraIcon className="h-5 w-5 text-slate-400" />}
                    {currentAppointment.type === 'Audio Call' && <PhoneIcon className="h-5 w-5 text-slate-400" />}
                    {currentAppointment.type === 'In-Person' && <CalendarIcon className="h-5 w-5 text-slate-400" />}
                    {currentAppointment.type === 'Messaging' && <MessageIcon className="h-5 w-5 text-slate-400" />}
                    <span className="font-medium">{currentAppointment.type}</span>
                </div>
            </div>
          </div>
          {isUpcoming && (
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0 self-start md:self-center flex-shrink-0">
              <button onClick={handleJoinCall} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors text-sm w-full">
                {currentAppointment.type === 'Messaging' ? 'Open Chat' : 'Join Call'}
              </button>
              <button 
                onClick={handleSetReminder} 
                disabled={isReminderSet}
                className={`px-4 py-2 font-semibold rounded-lg transition-colors text-sm w-full ${isReminderSet ? 'bg-green-100 text-green-700 cursor-not-allowed' : 'bg-teal-500 text-white hover:bg-teal-600'}`}
              >
                {isReminderSet ? 'Reminder Set ✓' : 'Set Reminder'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <button 
        onClick={toggleExpand}
        className="flex w-full items-center justify-between gap-1 border-t border-slate-200 px-6 py-3 text-sm font-semibold text-sky-600 hover:text-sky-800"
        aria-expanded={isExpanded}
        aria-controls={`appointment-details-${currentAppointment.id}`}
      >
        <span className="flex items-center gap-2">
            {isExpanded ? 'Hide Details' : 'View Details'}
            {isLoadingDetails && <span className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></span>}
        </span>
        {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
      </button>
      
      {/* Expandable Section */}
      <div 
        id={`appointment-details-${currentAppointment.id}`}
        className={`transition-all duration-300 ease-in-out grid ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
            <div className="px-6 pb-6 pt-4 bg-slate-50/50">
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm md:grid-cols-2">
                    <div>
                        <h4 className="mb-1 font-semibold text-slate-600">Reason for Visit</h4>
                        <p className="text-slate-800">{currentAppointment.reasonForVisit || 'Not specified'}</p>
                    </div>
                    {currentAppointment.preparationInstructions && (
                        <div>
                            <h4 className="mb-1 font-semibold text-slate-600">Preparation Instructions</h4>
                            <p className="text-slate-800">{currentAppointment.preparationInstructions}</p>
                        </div>
                    )}
                     <div>
                        <h4 className="mb-1 font-semibold text-slate-600">Hospital Affiliation</h4>
                        <p className="text-slate-800">{currentAppointment.doctor.hospital}</p>
                    </div>
                    
                    {/* Medical Summary from API */}
                    <div className="md:col-span-2 bg-white p-4 rounded-lg border border-slate-200 mt-2 shadow-sm">
                        <h4 className="mb-1 font-bold text-sky-700">Medical Summary</h4>
                        <p className="text-slate-700 leading-relaxed">
                            {currentAppointment.consultationNotes || <span className="italic text-slate-400">No summary available yet.</span>}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
];

const dayMap: { [key: string]: number } = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };

const AIBookingCard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  const handleAIBooking = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const result = await api.createAIAppointment(prompt);
      console.log('AI Booking Result:', result);
      
      if (result && result.status === true) {
        addNotification('AI Booking Successful', `Your request has been processed. ID: ${result.id}`, 'success');
        setPrompt('');
      } else {
         addNotification('AI Booking Failed', 'The server returned an unsuccessful status. Please try again.', 'error');
      }
    } catch (error) {
      console.error('AI Booking Error details:', error);
      addNotification('Connection Error', 'Failed to connect to AI service. Please check your network or try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-white/20 p-2 rounded-full">
          <SparklesIcon className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-bold">AI Quick Book</h2>
      </div>
      <p className="text-indigo-100 mb-4 text-sm">
        Describe your appointment needs naturally, and our AI agent will handle the rest.
        <br />
        <span className="italic opacity-80">Example: "Book a video call with Dr. Emily Carter next Monday at 10 AM for a checkup."</span>
      </p>
      <div className="flex gap-2">
        <input 
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAIBooking()}
          placeholder="Type your request here..."
          className="flex-1 p-3 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-300 outline-none"
          disabled={loading}
        />
        <button 
          onClick={handleAIBooking}
          disabled={loading || !prompt.trim()}
          className="bg-white text-indigo-600 font-bold py-3 px-6 rounded-lg hover:bg-indigo-50 transition-colors disabled:bg-white/50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>Book <SparklesIcon className="h-4 w-4" /></>
          )}
        </button>
      </div>
    </div>
  );
};

const NewAppointmentForm: React.FC<{ doctors: Doctor[]; onBookAppointment: (details: any) => void }> = ({ doctors, onBookAppointment }) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<'Video Call' | 'Audio Call' | 'In-Person' | 'Messaging' | null>(null);
  const [reason, setReason] = useState('');

  const selectedDoctor = useMemo(() => {
    if (!selectedDoctorId) return null;
    return doctors.find(d => d.id === parseInt(selectedDoctorId, 10)) || null;
  }, [selectedDoctorId, doctors]);

  const availableTypes = useMemo(() => {
    if (!selectedDoctor) return [];
    return selectedDoctor.consultationTypes || ['Video Call', 'Audio Call', 'In-Person', 'Messaging'];
  }, [selectedDoctor]);

  const availableDays = useMemo(() => {
    if (!selectedDoctor) return [];
    return selectedDoctor.availability.map(dayStr => dayMap[dayStr.substring(0, 3)]);
  }, [selectedDoctor]);

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDoctorId(e.target.value);
    setSelectedDate(null);
    setSelectedTime(null);
    setReason('');
    
    const doctor = doctors.find(d => d.id === parseInt(e.target.value, 10));
    if (doctor) {
        const types = doctor.consultationTypes || ['Video Call', 'Audio Call', 'In-Person', 'Messaging'];
        setAppointmentType(types[0]);
    } else {
        setAppointmentType(null);
    }
  };

  const handleConfirm = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !reason.trim() || !appointmentType) {
      alert('Please fill all fields to book an appointment.');
      return;
    }
    onBookAppointment({
      doctor: selectedDoctor,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      type: appointmentType,
      reasonForVisit: reason,
    });
    setSelectedDoctorId('');
    setSelectedDate(null);
    setSelectedTime(null);
    setAppointmentType(null);
    setReason('');
  };

  const goToPreviousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPrevMonthDisabled = currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();

  const calendarDays = [];
  for (let i = 0; i < startDayOfWeek; i++) { calendarDays.push(<div key={`empty-${i}`}></div>); }
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dayOfWeek = currentDate.getDay();
    const isPast = currentDate < today;
    const isAvailable = availableDays.includes(dayOfWeek);
    const isDisabled = isPast || !isAvailable;
    const isSelected = selectedDate && currentDate.toDateString() === selectedDate.toDateString();
    
    calendarDays.push(
      <button key={day} disabled={isDisabled} onClick={() => { setSelectedDate(currentDate); setSelectedTime(null); }}
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors text-sm ${
          isSelected ? 'bg-sky-600 text-white font-bold' : isDisabled ? 'text-slate-300 cursor-not-allowed bg-slate-50 line-through' : 'text-slate-700 hover:bg-sky-100'}`}>
        {day}
      </button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-700 mb-6">Schedule a New Appointment</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="doctor-select" className="block text-sm font-semibold text-slate-700 mb-2">1. Select a Doctor</label>
            <select id="doctor-select" value={selectedDoctorId} onChange={handleDoctorChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white transition">
              <option value="" disabled>-- Choose a Doctor --</option>
              {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialty}</option>)}
            </select>
          </div>
          {selectedDoctor && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">2. Consultation Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableTypes.includes('Video Call') && (
                    <button onClick={() => setAppointmentType('Video Call')} className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${appointmentType === 'Video Call' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                      <VideoCameraIcon className="h-6 w-6 text-sky-600 mb-1"/><span className="text-sm font-medium">Video</span>
                    </button>
                  )}
                  {availableTypes.includes('Audio Call') && (
                    <button onClick={() => setAppointmentType('Audio Call')} className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${appointmentType === 'Audio Call' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                      <PhoneIcon className="h-6 w-6 text-sky-600 mb-1"/><span className="text-sm font-medium">Audio</span>
                    </button>
                  )}
                  {availableTypes.includes('In-Person') && (
                    <button onClick={() => setAppointmentType('In-Person')} className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${appointmentType === 'In-Person' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                      <CalendarIcon className="h-6 w-6 text-sky-600 mb-1"/><span className="text-sm font-medium">In-Person</span>
                    </button>
                  )}
                  {availableTypes.includes('Messaging') && (
                      <button onClick={() => setAppointmentType('Messaging')} className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${appointmentType === 'Messaging' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                          <MessageIcon className="h-6 w-6 text-sky-600 mb-1"/><span className="text-sm font-medium">Message</span>
                      </button>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-semibold text-slate-700 mb-2">3. Reason for Visit</label>
                <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder="Briefly describe your symptoms or reason for the appointment..." className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white text-slate-800" />
              </div>
            </>
          )}
        </div>
        <div className={!selectedDoctor ? 'opacity-40 cursor-not-allowed' : ''}>
          <div className={!selectedDoctor ? 'pointer-events-none' : ''}>
            <h3 className="font-semibold text-slate-700 mb-2">4. Select Date & Time</h3>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <button onClick={goToPreviousMonth} disabled={isPrevMonthDisabled} className="p-2 rounded-full hover:bg-slate-200 disabled:text-slate-300 disabled:hover:bg-transparent"><ChevronLeftIcon className="h-5 w-5"/></button>
                <span className="font-bold text-slate-800">{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentMonth)}</span>
                <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-slate-200"><ChevronRightIcon className="h-5 w-5"/></button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-2">
                <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
              </div>
              <div className="grid grid-cols-7 gap-1">{calendarDays}</div>
            </div>

            {selectedDate && (
              <div className="mt-6">
                <h3 className="font-semibold text-slate-700 mb-2">Available times for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map(time => (
                    <button key={time} onClick={() => setSelectedTime(time)} className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${selectedTime === time ? 'bg-sky-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-slate-200 text-right">
        <button onClick={handleConfirm} disabled={!selectedDoctor || !selectedDate || !selectedTime || !reason.trim()} className="px-8 py-3 bg-teal-500 text-white font-bold rounded-full hover:bg-teal-600 transition-colors duration-300 transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none">
          Book Appointment
        </button>
      </div>
    </div>
  );
};

interface AppointmentsProps {
  appointments: Appointment[];
  doctors: Doctor[];
  onStartVideoCall: (participant: { name: string; imageUrl: string }) => void;
  onBookAppointment: (details: {
    doctor: Doctor;
    date: string;
    time: string;
    type: 'Video Call' | 'Audio Call' | 'In-Person' | 'Messaging';
    reasonForVisit: string;
  }) => void;
}

const Appointments: React.FC<AppointmentsProps> = ({ appointments, doctors, onStartVideoCall, onBookAppointment }) => {
  const [upcomingSortOrder, setUpcomingSortOrder] = useState<'newest' | 'oldest'>('oldest');
  const [pastSortOrder, setPastSortOrder] = useState<'newest' | 'oldest'>('newest');

  const sortAppointments = (appointments: Appointment[], order: 'newest' | 'oldest'): Appointment[] => {
    return [...appointments].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        if (order === 'newest') {
            return dateB.getTime() - dateA.getTime();
        } else {
            return dateA.getTime() - dateB.getTime();
        }
    });
  };

  const sortedUpcomingAppointments = useMemo(() => {
    const upcoming = appointments.filter(a => a.status === 'Upcoming');
    return sortAppointments(upcoming, upcomingSortOrder);
  }, [appointments, upcomingSortOrder]);

  const sortedPastAppointments = useMemo(() => {
    const past = appointments.filter(a => a.status !== 'Upcoming');
    return sortAppointments(past, pastSortOrder);
  }, [appointments, pastSortOrder]);

  const SortControls: React.FC<{ sortOrder: 'newest' | 'oldest', setSortOrder: (order: 'newest' | 'oldest') => void }> = ({ sortOrder, setSortOrder }) => (
    <div className="flex items-center gap-2">
        <button onClick={() => setSortOrder('newest')} className={`px-3 py-1 text-sm rounded-full transition-colors ${sortOrder === 'newest' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>Newest First</button>
        <button onClick={() => setSortOrder('oldest')} className={`px-3 py-1 text-sm rounded-full transition-colors ${sortOrder === 'oldest' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>Oldest First</button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">My Appointments</h1>
        <p className="text-slate-600">Manage your existing appointments or schedule a new one below.</p>
      </div>

      <section className="mb-12">
        <AIBookingCard />
        <NewAppointmentForm doctors={doctors} onBookAppointment={onBookAppointment} />
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-700">Upcoming</h2>
            <SortControls sortOrder={upcomingSortOrder} setSortOrder={setUpcomingSortOrder} />
        </div>
        <div className="space-y-6">
          {sortedUpcomingAppointments.length > 0 ? (
            sortedUpcomingAppointments.map(app => <AppointmentCard key={app.id} appointment={app} onStartVideoCall={onStartVideoCall} />)
          ) : (
            <p className="text-slate-500 text-center py-8">You have no upcoming appointments.</p>
          )}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-700">Past & Cancelled</h2>
            <SortControls sortOrder={pastSortOrder} setSortOrder={setPastSortOrder} />
        </div>
        <div className="space-y-6">
          {sortedPastAppointments.length > 0 ? (
            sortedPastAppointments.map(app => <AppointmentCard key={app.id} appointment={app} onStartVideoCall={onStartVideoCall} />)
          ) : (
            <p className="text-slate-500">No past appointments.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Appointments;
