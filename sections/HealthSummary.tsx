import React from 'react';
import { mockConversations } from '../data/messaging';
import { mockLabTests } from '../data/labs';
import { mockActivityFeed } from '../data/activityFeed';
import { CalendarIcon, MessageIcon, LabIcon, ChartBarIcon, HeartIcon, LungIcon, HeartPulseIcon } from '../components/IconComponents';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';
import { heartRateHistory, bloodPressureHistory, oxygenSaturationHistory } from '../data/vitalsHistory';
import { Appointment } from '../types';
import HealthGoals from '../components/HealthGoals';

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
            <p className="text-slate-500 font-medium">{label}</p>
        </div>
    </div>
);

interface HealthSummaryProps {
    appointments: Appointment[];
}

const HealthSummary: React.FC<HealthSummaryProps> = ({ appointments }) => {
    const upcomingAppointments = appointments.filter(a => a.status === 'Upcoming').length;
    const unreadMessages = mockConversations.reduce((sum, convo) => sum + convo.unreadCount, 0);
    const recentLabTests = mockLabTests.slice(0, 3).length; // Simulate recent

    const appointmentChartData = {
        labels: ['Upcoming', 'Completed', 'Cancelled'],
        values: [
            appointments.filter(a => a.status === 'Upcoming').length,
            appointments.filter(a => a.status === 'Completed').length,
            appointments.filter(a => a.status === 'Cancelled').length,
        ],
    };
    
    const chartLabels = heartRateHistory.map((d, i) => i % 3 === 0 ? `${Math.round(d.time / 60)}h ago` : '');

    const heartRateChartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Heart Rate (BPM)',
                values: heartRateHistory.map(d => d.bpm),
                color: 'stroke-red-500',
            }
        ]
    };
    
    const bloodPressureChartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Systolic (mmHg)',
                values: bloodPressureHistory.map(d => d.systolic),
                color: 'stroke-sky-500',
            },
            {
                label: 'Diastolic (mmHg)',
                values: bloodPressureHistory.map(d => d.diastolic),
                color: 'stroke-teal-500',
            }
        ]
    };

    const oxygenSaturationChartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'SpO₂ (%)',
                values: oxygenSaturationHistory.map(d => d.spo2),
                color: 'stroke-indigo-500',
            }
        ]
    };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Health Summary</h1>
        <p className="text-slate-600">A quick overview of your health activities and records.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard 
            icon={<CalendarIcon className="h-7 w-7 text-sky-700" />} 
            label="Upcoming Appointments" 
            value={upcomingAppointments}
            color="bg-sky-100"
        />
        <MetricCard 
            icon={<MessageIcon className="h-7 w-7 text-teal-700" />} 
            label="Unread Messages" 
            value={unreadMessages}
            color="bg-teal-100"
        />
        <MetricCard 
            icon={<LabIcon className="h-7 w-7 text-amber-700" />} 
            label="Recent Lab Tests" 
            value={recentLabTests}
            color="bg-amber-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Vitals History */}
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                <HeartIcon className="h-6 w-6 text-red-500" />
                Heart Rate (24h)
            </h2>
            <div className="h-80">
                <LineChart data={heartRateChartData} />
            </div>
        </div>

        {/* Appointment Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                <ChartBarIcon className="h-6 w-6 text-slate-500" />
                Appointment Analytics
            </h2>
            <div className="h-80">
                 <BarChart data={appointmentChartData} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <HeartPulseIcon className="h-6 w-6 text-sky-500" />
                  Blood Pressure (24h)
              </h2>
              <div className="h-80">
                  <LineChart data={bloodPressureChartData} />
              </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <LungIcon className="h-6 w-6 text-indigo-500" />
                  Blood Oxygen (24h)
              </h2>
              <div className="h-80">
                  <LineChart data={oxygenSaturationChartData} />
              </div>
          </div>
      </div>

      <div className="mb-8">
        <HealthGoals />
      </div>
        
      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Recent Activity</h2>
            <ul className="space-y-4 max-h-96 overflow-y-auto">
                {mockActivityFeed.map(activity => (
                    <li key={activity.id} className="flex items-start gap-3">
                        <div className="bg-slate-100 p-2 rounded-full mt-1">
                            <activity.icon className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-800 leading-tight">{activity.description}</p>
                            <p className="text-xs text-slate-400">{activity.timestamp}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
};

export default HealthSummary;