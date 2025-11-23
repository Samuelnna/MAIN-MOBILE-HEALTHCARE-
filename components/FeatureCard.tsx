
import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-gradient-to-br from-sky-500 to-sky-700 p-6 rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
    >
      <div className="bg-white/20 p-4 rounded-full mb-4 text-white">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-sky-100">{description}</p>
    </div>
  );
};

export default FeatureCard;