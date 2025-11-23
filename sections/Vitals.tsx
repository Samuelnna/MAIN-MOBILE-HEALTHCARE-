
import React, { useState, useEffect, useRef } from 'react';
import { VitalSigns, HeartRateDataPoint } from '../types';
import { HeartIcon, LungIcon, FootstepsIcon, MoonIcon, BluetoothIcon } from '../components/IconComponents';
import { sleepHistory } from '../data/vitalsHistory';
import { mockHealthGoals } from '../data/healthGoals';
import LineChart from '../components/LineChart';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

const initialVitals: VitalSigns = {
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    oxygenSaturation: 98,
    steps: mockHealthGoals.find(g => g.title === 'Daily Steps')?.currentProgress || 0,
};

interface VitalsCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    unit: string;
    colorClass: string;
    progress?: number;
    target?: number;
}

const VitalsCard: React.FC<VitalsCardProps> = ({ icon, label, value, unit, colorClass, progress, target }) => {
    const showProgressBar = typeof progress === 'number' && typeof target === 'number' && target > 0;
    const percentage = showProgressBar ? Math.min(100, (progress / target) * 100) : 0;
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${colorClass}`}>
                        {icon}
                    </div>
                    <div>
                        <p className="text-slate-500 font-medium">{label}</p>
                        <p className="text-3xl font-bold text-slate-800">
                            {value} <span className="text-lg font-semibold text-slate-600">{unit}</span>
                        </p>
                    </div>
                </div>
            </div>
            {showProgressBar && (
                <div className="mt-4">
                    <div className="flex justify-between text-sm font-medium text-slate-500 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(percentage)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                            className="bg-green-500 h-2.5 rounded-full"
                            style={{ width: `${percentage}%`, transition: 'width 0.5s ease-in-out' }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-400 text-right mt-1">Goal: {target.toLocaleString()} {unit}</p>
                </div>
            )}
        </div>
    );
};

const Vitals: React.FC = () => {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [vitals, setVitals] = useState<VitalSigns>(initialVitals);
    const [liveHeartRateData, setLiveHeartRateData] = useState<HeartRateDataPoint[]>([]);
    const intervalRef = useRef<number | null>(null);

    const stepGoal = mockHealthGoals.find(g => g.title === 'Daily Steps');

    const stopDataStream = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        // Cleanup on component unmount
        return () => stopDataStream();
    }, []);

    const handleConnect = () => {
        setStatus('connecting');
        setTimeout(() => {
            setStatus('connected');
            startDataStream();
        }, 2000);
    };

    const handleDisconnect = () => {
        setStatus('disconnected');
        stopDataStream();
        setVitals(initialVitals);
        setLiveHeartRateData([]);
    };

    const startDataStream = () => {
        const initialData = Array.from({ length: 60 }, (_, i) => ({ time: 60 - i, bpm: 70 + Math.random() * 5 - 2.5 }));
        setLiveHeartRateData(initialData);

        intervalRef.current = window.setInterval(() => {
            setVitals(prev => {
                const newHr = prev.heartRate + Math.round(Math.random() * 4 - 2);
                return {
                    ...prev,
                    heartRate: Math.max(55, Math.min(130, newHr)), // clamp HR
                    oxygenSaturation: Math.max(95, Math.min(99, prev.oxygenSaturation + (Math.random() * 0.4 - 0.2))),
                    steps: prev.steps + Math.floor(Math.random() * 5),
                };
            });

            setLiveHeartRateData(prev => {
                const newPoint = { time: 0, bpm: vitals.heartRate };
                // Shift all existing points
                const updatedData = prev.map(p => ({ ...p, time: p.time + 1 })).slice(1);
                return [...updatedData, newPoint];
            });

        }, 2000);
    };

    const getStatusInfo = () => {
        switch (status) {
            case 'connected': return { text: 'Device Connected', color: 'text-green-500', button: <button onClick={handleDisconnect} className="px-6 py-2 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition">Disconnect</button> };
            case 'connecting': return { text: 'Connecting...', color: 'text-amber-500', button: <button className="px-6 py-2 bg-slate-400 text-white font-bold rounded-full cursor-not-allowed" disabled>Connecting...</button> };
            default: return { text: 'Device Disconnected', color: 'text-slate-500', button: <button onClick={handleConnect} className="px-6 py-2 bg-sky-600 text-white font-bold rounded-full hover:bg-sky-700 transition">Connect Device</button> };
        }
    };
    
    const liveHeartRateChartData = {
        labels: liveHeartRateData.map(d => d.time % 10 === 0 ? `${d.time}s` : ''),
        datasets: [{
            label: 'Heart Rate (BPM)',
            values: liveHeartRateData.map(d => d.bpm),
            color: 'stroke-red-500',
        }]
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Vitals Tracking</h1>
                        <p className="text-slate-600">Connect your wearable device to monitor your health in real-time.</p>
                    </div>
                    <div className="text-center">
                        <div className={`flex items-center justify-center gap-2 font-semibold mb-3 ${getStatusInfo().color}`}>
                            <BluetoothIcon className="h-5 w-5" />
                            <span>{getStatusInfo().text}</span>
                        </div>
                        {getStatusInfo().button}
                    </div>
                </div>
            </div>

            <div className={`transition-opacity duration-500 ${status === 'connected' ? 'opacity-100' : 'opacity-40 blur-sm pointer-events-none'}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <VitalsCard icon={<HeartIcon className="h-7 w-7 text-red-700"/>} label="Heart Rate" value={vitals.heartRate.toString()} unit="BPM" colorClass="bg-red-100" />
                    <VitalsCard icon={<LungIcon className="h-7 w-7 text-sky-700"/>} label="Blood Oxygen" value={`${vitals.oxygenSaturation.toFixed(1)}`} unit="SpO₂ %" colorClass="bg-sky-100"/>
                    <VitalsCard 
                        icon={<FootstepsIcon className="h-7 w-7 text-green-700"/>} 
                        label="Steps Today" 
                        value={vitals.steps.toLocaleString()} 
                        unit="steps" 
                        colorClass="bg-green-100"
                        progress={vitals.steps}
                        target={stepGoal?.target}
                    />
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-slate-700 mb-4">Live Heart Rate</h2>
                        <div className="h-80">
                            {status === 'connected' && liveHeartRateData.length > 0 ? <LineChart data={liveHeartRateChartData} /> : <div className="h-full w-full flex items-center justify-center text-slate-400">Connect device to see live data</div>}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2"><MoonIcon className="h-6 w-6 text-indigo-500"/> Last Night's Sleep</h2>
                        <div className="space-y-4 text-lg">
                            <div className="flex justify-between items-baseline"><span className="font-medium text-slate-600">Total</span><span className="font-bold text-slate-800">{sleepHistory.totalSleep}</span></div>
                            <div className="flex justify-between items-baseline"><span className="font-medium text-slate-600">Deep</span><span className="font-bold text-slate-800">{sleepHistory.deep}</span></div>
                            <div className="flex justify-between items-baseline"><span className="font-medium text-slate-600">Light</span><span className="font-bold text-slate-800">{sleepHistory.light}</span></div>
                            <div className="flex justify-between items-baseline"><span className="font-medium text-slate-600">REM</span><span className="font-bold text-slate-800">{sleepHistory.rem}</span></div>
                            <div className="flex justify-between items-baseline"><span className="font-medium text-slate-600">Awake</span><span className="font-bold text-slate-800">{sleepHistory.awake}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Vitals;
