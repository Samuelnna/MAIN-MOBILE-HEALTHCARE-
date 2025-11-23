
import React, { useState, useMemo } from 'react';
import type { TriageReport, VirtualCard, Doctor, Hospital, LabTest, Section, Referral, Order, CartItem, HospitalServiceAppointmentCard, User, MedicationRecord, Medication } from '../types';
import { ClipboardDocumentListIcon, ChevronDownIcon, ChevronUpIcon, DoctorIcon, HospitalIcon, LabIcon, ShoppingCartIcon, SparklesIcon, PharmacyIcon, CalendarIcon, CheckCircleIcon, ExclamationTriangleIcon } from '../components/IconComponents';
import HospitalServiceCardModal from '../components/HospitalServiceCardModal';
import CreateEMRModal from '../components/CreateEMRModal';

const TriageLevelBadge: React.FC<{ level: 'Emergency' | 'Urgent' | 'Routine' }> = ({ level }) => {
    const levelInfo = {
        Emergency: { color: 'bg-red-100 text-red-800', text: 'Emergency' },
        Urgent: { color: 'bg-amber-100 text-amber-800', text: 'Urgent' },
        Routine: { color: 'bg-sky-100 text-sky-800', text: 'Routine' },
    };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${levelInfo[level].color}`}>{levelInfo[level].text}</span>;
}

interface TriageReportCardProps {
    report: TriageReport;
    doctors: Doctor[];
    hospitals: Hospital[];
    labTests: LabTest[];
    setActiveSection: (section: Section) => void;
}

const ReferralCard: React.FC<{ referral: Referral; doctors: Doctor[]; hospitals: Hospital[]; labTests: LabTest[]; setActiveSection: (section: Section) => void; }> = ({ referral, doctors, hospitals, labTests, setActiveSection }) => {
    let entity: Doctor | Hospital | LabTest | undefined;
    let image: string | undefined;
    let icon: React.ReactNode;
    let details: string | undefined;
    let buttonText: string = 'View Details';
    let targetSection: Section = 'Dashboard';

    if (referral.type === 'Doctor') {
        entity = doctors.find(d => d.id === referral.id);
        image = (entity as Doctor)?.imageUrl;
        details = (entity as Doctor)?.specialty;
        buttonText = 'Book Now';
        targetSection = 'Doctors';
    } else if (referral.type === 'Hospital') {
        entity = hospitals.find(h => h.id === referral.id);
        image = (entity as Hospital)?.imageUrl;
        details = (entity as Hospital)?.location;
        buttonText = 'View Hospital';
        targetSection = 'Hospitals';
    } else if (referral.type === 'Lab') {
        entity = labTests.find(l => l.id === referral.id);
        icon = <LabIcon className="h-8 w-8 text-sky-600" />;
        details = (entity as LabTest)?.category;
        buttonText = 'Schedule Test';
        targetSection = 'Labs';
    }

    if (!entity) return (
        <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-700">Referral: {referral.name}</p>
            <p className="text-sm text-slate-500">Details not found for this referral.</p>
        </div>
    );

    return (
        <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {image ? (
                <img src={image} alt={entity.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
            ) : icon ? (
                <div className="w-16 h-16 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">{icon}</div>
            ) : null}
            <div className="flex-grow">
                <p className="font-bold text-slate-800">{entity.name}</p>
                <p className="text-sm text-slate-500 font-medium">{details}</p>
                <p className="text-sm text-slate-600 mt-1">
                    <span className="font-semibold">Reason:</span> {referral.reason}
                </p>
            </div>
            <button
                onClick={() => setActiveSection(targetSection)}
                className="w-full sm:w-auto px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors text-sm flex-shrink-0"
            >
                {buttonText}
            </button>
        </div>
    );
};


const TriageReportCard: React.FC<TriageReportCardProps> = ({ report, doctors, hospitals, labTests, setActiveSection }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
        <div className="bg-white rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg">
            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Triage Report</h3>
                        <p className="text-sm text-slate-500">
                            {new Date(report.date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <TriageLevelBadge level={report.triageLevel} />
                </div>
                <div className="mt-4">
                    <h4 className="font-semibold text-slate-600">Primary Complaint</h4>
                    <p className="text-slate-800 text-sm">{report.symptomSummary.split('\n')[0]}</p>
                </div>
            </div>
             <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between gap-1 border-t border-slate-200 px-6 py-3 text-sm font-semibold text-sky-600 hover:bg-slate-50"
              >
                <span>{isExpanded ? 'Hide Full Report' : 'View Full Report'}</span>
                {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </button>
            <div className={`transition-all duration-300 ease-in-out grid ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-4 bg-slate-50/50 space-y-6">
                        {report.referrals && report.referrals.length > 0 && (
                            <div>
                                <h4 className="font-bold text-slate-700 mb-3">Referrals & Next Steps</h4>
                                <div className="space-y-3">
                                    {report.referrals.map((ref, index) => (
                                        <ReferralCard 
                                            key={index} 
                                            referral={ref}
                                            doctors={doctors}
                                            hospitals={hospitals}
                                            labTests={labTests}
                                            setActiveSection={setActiveSection}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <h4 className="font-bold text-slate-700 mb-2">Detailed Report</h4>
                            <div className="prose prose-sm max-w-none p-4 bg-white rounded-md border border-slate-200">
                                <div dangerouslySetInnerHTML={{ __html: report.fullReport.replace(/\n/g, '<br />') }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const VirtualHospitalCard: React.FC<{ card: VirtualCard }> = ({ card }) => {
     const levelInfo = {
        Emergency: { color: 'from-red-500 to-red-700' },
        Urgent: { color: 'from-amber-500 to-amber-700' },
        Routine: { color: 'from-sky-500 to-sky-700' },
    };
    return (
        <div className={`bg-gradient-to-br ${levelInfo[card.triageLevel].color} p-6 rounded-xl shadow-lg text-white flex flex-col justify-between`}>
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-2xl">{card.patientName}</h3>
                        <p className="opacity-80 text-sm">Patient ID: {card.patientId}</p>
                    </div>
                    <div className="bg-white p-1 rounded-md">
                        {/* Placeholder for QR Code */}
                        <div className="w-16 h-16 bg-slate-800"></div>
                    </div>
                </div>
                <div className="mt-6">
                    <p className="text-xs uppercase opacity-80 font-semibold tracking-wider">Chief Complaint</p>
                    <p className="font-medium text-lg">{card.chiefComplaint}</p>
                </div>
                 {card.referralInfo && (
                    <div className="mt-4">
                        <p className="text-xs uppercase opacity-80 font-semibold tracking-wider">Referral</p>
                        <p className="font-medium">{card.referralInfo}</p>
                    </div>
                )}
            </div>
             <div className="mt-4 flex justify-between items-end">
                <div>
                    <p className="text-xs uppercase opacity-80 font-semibold tracking-wider">Triage Level</p>
                    <p className="font-bold text-xl">{card.triageLevel}</p>
                </div>
                <div>
                    <p className="text-xs text-right opacity-80">Issued: {new Date(card.issuedDate).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    )
}

const OrderHistoryCard: React.FC<{ order: Order }> = ({ order }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const statusStyles = {
        Processing: 'bg-amber-100 text-amber-800',
        Shipped: 'bg-blue-100 text-blue-800',
        'Ready for Pickup': 'bg-sky-100 text-sky-800',
        Completed: 'bg-green-100 text-green-800',
    };
    
    return (
        <div className="bg-white rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg">
            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Order #{order.id.substring(4)}</h3>
                        <p className="text-sm text-slate-500">
                            {new Date(order.date).toLocaleString()}
                        </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[order.status]}`}>
                        {order.status}
                    </span>
                </div>
                <div className="mt-4 text-sm">
                    <p><span className="font-semibold text-slate-600">Total:</span> ${order.total.toFixed(2)}</p>
                    <p><span className="font-semibold text-slate-600">Method:</span> {order.deliveryMethod}</p>
                </div>
            </div>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between gap-1 border-t border-slate-200 px-6 py-3 text-sm font-semibold text-sky-600 hover:bg-slate-50"
            >
                <span>{isExpanded ? 'Hide Items' : 'View Items'} ({order.items.length})</span>
                {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </button>
             <div className={`transition-all duration-300 ease-in-out grid ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-4 bg-slate-50/50">
                        <ul className="space-y-2">
                            {order.items.map((item: CartItem) => (
                                <li key={item.id} className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600">{item.name} (x{item.quantity})</span>
                                    <span className="font-medium text-slate-800">${(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HospitalServiceAppointmentDisplay: React.FC<{ card: HospitalServiceAppointmentCard; onViewCard: () => void; }> = ({ card, onViewCard }) => (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800">{card.serviceName}</h3>
            <p className="text-sm text-slate-500 font-medium">at {card.hospitalName}</p>
            <p className="text-sm text-slate-500">
                {new Date(card.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {card.time}
            </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto self-start md:self-stretch">
            <span className="text-xs font-semibold bg-sky-100 text-sky-800 px-3 py-1.5 rounded-full flex items-center justify-center">Upcoming</span>
            <button onClick={onViewCard} className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors text-sm">View Appointment Card</button>
        </div>
    </div>
);

const MedicationRecordCard: React.FC<{ record: MedicationRecord }> = ({ record }) => {
    const isExpired = record.end_date && new Date(record.end_date) < new Date();
    
    return (
        <div className={`bg-white rounded-lg shadow-md p-6 transition-shadow duration-300 hover:shadow-lg flex flex-col md:flex-row gap-6 items-start ${isExpired ? 'opacity-75' : ''}`}>
            <div className={`p-4 rounded-full flex-shrink-0 ${isExpired ? 'bg-slate-100' : 'bg-teal-100'}`}>
                 <PharmacyIcon className={`h-8 w-8 ${isExpired ? 'text-slate-400' : 'text-teal-600'}`} />
            </div>
            <div className="flex-grow w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                    <div>
                        <div className="flex items-center gap-2">
                             <h3 className="text-xl font-bold text-slate-800">{record.name || 'Unknown Medication'}</h3>
                             {isExpired ? (
                                 <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">Completed</span>
                             ) : (
                                 <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">Active</span>
                             )}
                        </div>
                        <p className="text-sm font-semibold text-slate-600 mt-1">{record.dosage} • {record.frequency}</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-50 text-slate-500 border border-slate-200 font-mono">
                        Rx: {record.unique_id}
                    </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 text-sm">
                     <div className="flex items-center gap-2 text-slate-600">
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold">Start Date</p>
                            <p className="font-medium">{record.start_date ? new Date(record.start_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold">End Date</p>
                            <p className="font-medium">{record.end_date ? new Date(record.end_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 text-slate-600">
                        <div className="w-4 h-4 flex items-center justify-center rounded-full border border-slate-400 text-[10px] font-serif italic text-slate-500">D</div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold">Duration</p>
                            <p className="font-medium">{record.duration || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                         <div className="w-4 h-4 flex items-center justify-center rounded-full border border-slate-400 text-[10px] font-serif italic text-slate-500">C</div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold">Prescribed</p>
                            <p className="font-medium">{record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface PatientRecordsProps {
    user: User;
    reports: TriageReport[];
    cards: VirtualCard[];
    orders: Order[];
    hospitalServiceCards: HospitalServiceAppointmentCard[];
    medicationRecords?: MedicationRecord[];
    purchasedMedications?: Medication[];
    doctors: Doctor[];
    hospitals: Hospital[];
    labTests: LabTest[];
    setActiveSection: (section: Section) => void;
}

const PatientRecords: React.FC<PatientRecordsProps> = ({ user, reports, cards, orders, hospitalServiceCards, medicationRecords, purchasedMedications, doctors, hospitals, labTests, setActiveSection }) => {
    const [activeTab, setActiveTab] = useState<'reports' | 'cards' | 'services' | 'medications' | 'orders'>('reports');
    const [viewingCard, setViewingCard] = useState<HospitalServiceAppointmentCard | null>(null);
    const [isEMRModalOpen, setIsEMRModalOpen] = useState(false);

    // Combine API records and purchased medications (mapped to record format)
    const mergedMedications = useMemo(() => {
        const apiRecords = medicationRecords || [];
        const localRecords: MedicationRecord[] = (purchasedMedications || []).map(med => ({
            id: med.id,
            unique_id: `LCL-${med.id}-${Date.now().toString().slice(-4)}`, // Generate a dummy ID
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency || 'As directed',
            start_date: med.startDate || new Date().toISOString().split('T')[0],
            end_date: med.endDate || '',
            duration: med.duration || '',
            created_at: med.dateAdded || new Date().toISOString(),
            patient: 0,
            encounter: 0
        }));
        
        // Combine arrays, prioritizing API records if IDs match (though they likely won't due to mocking)
        // For this purpose, we just concatenate them
        return [...localRecords, ...apiRecords];
    }, [medicationRecords, purchasedMedications]);

    return (
        <>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white p-8 rounded-lg shadow-md mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                        <ClipboardDocumentListIcon className="h-8 w-8 text-sky-600" />
                        Patient Records
                    </h1>
                    <p className="text-slate-600">View your AI-generated triage reports, virtual cards, medications, and order history.</p>
                </div>
                <button 
                    onClick={() => setIsEMRModalOpen(true)}
                    className="bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-md"
                >
                    <SparklesIcon className="h-5 w-5" />
                    Create AI EMR
                </button>
            </div>

            <div className="bg-white p-2 rounded-lg shadow-md">
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6 px-4 overflow-x-auto" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'reports' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                           <ClipboardDocumentListIcon className="inline h-5 w-5 mr-2" /> Triage Reports ({reports.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('cards')}
                            className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'cards' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                           <ClipboardDocumentListIcon className="inline h-5 w-5 mr-2" /> Triage Cards ({cards.length})
                        </button>
                         <button
                            onClick={() => setActiveTab('medications')}
                            className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'medications' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                           <PharmacyIcon className="inline h-5 w-5 mr-2" /> Prescriptions ({mergedMedications.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'services' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                           <HospitalIcon className="inline h-5 w-5 mr-2" /> Services & Procedures ({hospitalServiceCards.length})
                        </button>
                         <button
                            onClick={() => setActiveTab('orders')}
                            className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'orders' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                           <ShoppingCartIcon className="inline h-5 w-5 mr-2" /> Order History ({orders.length})
                        </button>
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'reports' && (
                        <div className="space-y-6">
                            {reports.length > 0 ? (
                                reports.map(report => <TriageReportCard 
                                                            key={report.id} 
                                                            report={report}
                                                            doctors={doctors}
                                                            hospitals={hospitals}
                                                            labTests={labTests}
                                                            setActiveSection={setActiveSection}
                                                        />)
                            ) : (
                                <p className="text-center text-slate-500 py-12">No triage reports found. Use the AI Triage Assistant to generate one.</p>
                            )}
                        </div>
                    )}
                     {activeTab === 'cards' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {cards.length > 0 ? (
                                cards.map(card => <VirtualHospitalCard key={card.id} card={card} />)
                            ) : (
                                <p className="text-center text-slate-500 py-12 col-span-full">No virtual cards found. A card is generated with each triage report.</p>
                            )}
                        </div>
                    )}
                     {activeTab === 'medications' && (
                        <div className="space-y-6">
                            {mergedMedications.length > 0 ? (
                                mergedMedications.map(rec => <MedicationRecordCard key={rec.id} record={rec} />)
                            ) : (
                                <p className="text-center text-slate-500 py-12">No prescription records found. Purchase items in the Pharmacy to see them here.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'services' && (
                        <div className="space-y-6">
                            {hospitalServiceCards.length > 0 ? (
                                hospitalServiceCards.map(card => <HospitalServiceAppointmentDisplay key={card.id} card={card} onViewCard={() => setViewingCard(card)} />)
                            ) : (
                                <p className="text-center text-slate-500 py-12">No hospital services scheduled. Visit the Hospitals section to book a procedure.</p>
                            )}
                        </div>
                    )}
                     {activeTab === 'orders' && (
                        <div className="space-y-6">
                            {orders.length > 0 ? (
                                orders.map(order => <OrderHistoryCard key={order.id} order={order} />)
                            ) : (
                                <p className="text-center text-slate-500 py-12">You have no past orders. Visit the pharmacy to make a purchase.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
        {viewingCard && <HospitalServiceCardModal card={viewingCard} onClose={() => setViewingCard(null)} />}
        {isEMRModalOpen && <CreateEMRModal user={user} onClose={() => setIsEMRModalOpen(false)} />}
        </>
    );
};

export default PatientRecords;
