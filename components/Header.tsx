
import React, { useState, useEffect, useRef } from 'react';
import type { Section } from '../types';
import { HospitalIcon, BellIcon, ShoppingCartIcon, Cog6ToothIcon, PatientIcon, DoctorProfileIcon, UserPlusIcon } from './IconComponents';
import { requestNotificationPermission } from '../utils/notifications';
import { CartItem, User } from '../types';
import { useNotification } from '../contexts/NotificationContext';

interface HeaderProps {
  user: User;
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  cartItems: CartItem[];
  onCartClick: () => void;
  onOpenCreatePatient?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, activeSection, setActiveSection, cartItems, onCartClick, onOpenCreatePatient }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotification();

  useEffect(() => {
    // Check initial permission status on mount
    if ('permission' in Notification) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async () => {
    const status = await requestNotificationPermission();
    setPermissionStatus(status);

    if (status === 'granted') {
      addNotification('Notifications Enabled', 'You will now receive system notifications for important updates.', 'success');
    } else if (status === 'denied') {
      addNotification('Notifications Blocked', 'You can enable them in your browser settings to receive reminders.', 'warning');
    }
  };

  const getBellColor = () => {
    switch(permissionStatus) {
      case 'granted':
        return 'text-green-300';
      case 'denied':
        return 'text-red-300';
      default:
        return 'text-slate-100';
    }
  };

  const navItems: { name: Section, label: string }[] = [
    { name: 'Dashboard', label: 'Home' },
    { name: 'Health Summary', label: 'Health Summary' },
    { name: 'Appointments', label: 'Appointments' },
    { name: 'Messaging', label: 'Messages' },
    { name: 'Hospitals', label: 'Hospitals' },
    { name: 'Doctors', label: 'Doctors' },
    { name: 'Labs', label: 'Labs' },
    { name: 'Pharmacy', label: 'Pharmacy' },
    { name: 'Patient Records', label: 'My Records' },
  ];

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const NavLink: React.FC<{ name: Section, label: string }> = ({ name, label }) => (
    <button
      onClick={() => {
        setActiveSection(name);
        setIsMenuOpen(false);
      }}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        activeSection === name
          ? 'bg-sky-100 text-sky-600'
          : 'text-slate-100 hover:bg-sky-700 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
  
  const UserIcon = user.userType === 'patient' ? PatientIcon : DoctorProfileIcon;

  return (
    <header className="bg-sky-600 shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveSection('Dashboard')} className="flex-shrink-0 flex items-center gap-2 text-white">
              <HospitalIcon className="h-8 w-8 text-white" />
              <span className="font-bold text-xl">Mobile Health</span>
            </button>
          </div>
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map(item => <NavLink key={item.name} {...item} />)}
            </div>
          </div>
          <div className="flex items-center">
             {user.userType === 'professional' && onOpenCreatePatient && (
                <button
                  onClick={onOpenCreatePatient}
                  className="p-2 rounded-full hover:bg-sky-700 transition-colors text-sky-100 mr-2 hidden md:block"
                  title="Create New Patient"
                >
                  <UserPlusIcon className="h-6 w-6" />
                </button>
             )}
             <button 
                onClick={handleNotificationClick} 
                className={`p-2 rounded-full hover:bg-sky-700 transition-colors ${getBellColor()}`}
                title={`Notifications: ${permissionStatus}`}
              >
              <BellIcon className="h-6 w-6" />
            </button>
            <button 
                onClick={onCartClick} 
                className="relative p-2 rounded-full hover:bg-sky-700 transition-colors text-slate-100 ml-2"
                title="Open Cart"
              >
              <ShoppingCartIcon className="h-6 w-6" />
              {totalCartItems > 0 && (
                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full ring-2 ring-sky-600 bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </button>
             <div className="relative ml-3" ref={profileMenuRef}>
              <div>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="p-1 rounded-full text-slate-100 hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-600 focus:ring-white"
                  aria-label="Open user menu"
                >
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <UserIcon className="h-7 w-7" />
                  )}
                </button>
              </div>
              {isProfileMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 border-b border-slate-200">
                      <p className="text-sm font-medium text-slate-800 truncate">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                      {user.userType === 'professional' && (
                        <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">Professional</span>
                      )}
                  </div>
                  {user.userType === 'professional' && onOpenCreatePatient && (
                      <button
                        onClick={() => {
                          onOpenCreatePatient();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 md:hidden"
                      >
                        <UserPlusIcon className="h-5 w-5 text-slate-500"/>
                        Create New Patient
                      </button>
                  )}
                  <button
                    onClick={() => {
                      setActiveSection('Profile');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <Cog6ToothIcon className="h-5 w-5 text-slate-500"/>
                    Profile & Settings
                  </button>
                </div>
              )}
            </div>
            <div className="lg:hidden ml-2">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white hover:text-slate-200 focus:outline-none">
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-sky-600">
            {navItems.map(item => <NavLink key={item.name} {...item} />)}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
