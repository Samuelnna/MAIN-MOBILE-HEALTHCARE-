import React, { useState } from 'react';
import type { HealthTopic } from '../types';
import { mockHealthTopics } from '../data/healthTopics';
import { LightBulbIcon } from './IconComponents';
import HealthTopicDetail from './HealthTopicDetail';

const TopicCard: React.FC<{ topic: HealthTopic; onClick: () => void }> = ({ topic, onClick }) => (
    <div 
        onClick={onClick}
        className="flex-shrink-0 w-72 lg:w-auto bg-white rounded-lg shadow-md overflow-hidden snap-start group cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
    >
        <div className="h-40 overflow-hidden">
            <img src={topic.imageUrl} alt={topic.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-4">
            <p className="text-xs font-semibold text-sky-600 uppercase">{topic.category}</p>
            <h4 className="font-bold text-slate-800 mt-1 truncate group-hover:text-sky-700">{topic.title}</h4>
            <p className="text-sm text-slate-500 mt-2">{topic.readTime} min read</p>
        </div>
    </div>
);

const HealthTopics: React.FC = () => {
    const [selectedTopic, setSelectedTopic] = useState<HealthTopic | null>(null);

  return (
    <>
    <div className="bg-slate-100 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
                <LightBulbIcon className="h-8 w-8 text-amber-500" />
                <h2 className="text-3xl font-bold text-slate-800">Health & Wellness Topics</h2>
            </div>
            <div className="flex gap-6 pb-4 overflow-x-auto snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible">
                {mockHealthTopics.map(topic => (
                    <TopicCard key={topic.id} topic={topic} onClick={() => setSelectedTopic(topic)} />
                ))}
            </div>
        </div>
    </div>
    {selectedTopic && (
        <HealthTopicDetail 
            topic={selectedTopic}
            onClose={() => setSelectedTopic(null)}
        />
    )}
    </>
  );
};

export default HealthTopics;