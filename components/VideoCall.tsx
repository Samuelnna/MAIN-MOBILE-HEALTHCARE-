import React, { useState } from 'react';
import { MicrophoneOnIcon, MicrophoneOffIcon, VideoCameraIcon, VideoCameraOffIcon, PhoneXMarkIcon } from './IconComponents';

interface VideoCallProps {
  participant: {
    name: string;
    imageUrl: string;
  };
  onEndCall: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ participant, onEndCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const ControlButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; ariaLabel: string }> = ({ onClick, children, className = '', ariaLabel }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`p-4 rounded-full transition-colors duration-200 ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {/* Remote Participant Video */}
      <div className="relative flex-1 bg-black flex items-center justify-center">
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
          {participant.name}
        </div>
        {/* Placeholder for remote video stream */}
        <div className="w-full h-full flex items-center justify-center">
            <img src={participant.imageUrl} alt={participant.name} className="w-40 h-40 rounded-full object-cover opacity-30" />
        </div>
      </div>

      {/* Local User Video */}
      <div className="absolute bottom-28 right-4 w-40 h-32 md:w-48 md:h-36 bg-slate-800 border-2 border-slate-600 rounded-lg overflow-hidden">
        {isCameraOff ? (
            <div className="w-full h-full flex items-center justify-center bg-black">
                <VideoCameraOffIcon className="h-10 w-10 text-slate-400" />
            </div>
        ) : (
            <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white">
                {/* Placeholder for local video stream */}
                You
            </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-slate-900 bg-opacity-70 py-4 flex justify-center items-center gap-4">
        <ControlButton
          onClick={() => setIsMuted(!isMuted)}
          className={isMuted ? 'bg-white text-slate-800' : 'bg-slate-700 text-white hover:bg-slate-600'}
          ariaLabel={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMuted ? <MicrophoneOffIcon className="h-6 w-6" /> : <MicrophoneOnIcon className="h-6 w-6" />}
        </ControlButton>

        <ControlButton
          onClick={() => setIsCameraOff(!isCameraOff)}
          className={isCameraOff ? 'bg-white text-slate-800' : 'bg-slate-700 text-white hover:bg-slate-600'}
          ariaLabel={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
        >
          {isCameraOff ? <VideoCameraOffIcon className="h-6 w-6" /> : <VideoCameraIcon className="h-6 w-6" />}
        </ControlButton>

        <ControlButton
          onClick={onEndCall}
          className="bg-red-600 text-white hover:bg-red-700"
          ariaLabel="End call"
        >
          <PhoneXMarkIcon className="h-6 w-6" />
        </ControlButton>
      </div>
    </div>
  );
};

export default VideoCall;
