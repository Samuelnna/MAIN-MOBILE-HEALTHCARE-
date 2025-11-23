
import { Doctor, Hospital, LabTest, Medication, Appointment, MedicationRecord } from '../types';
import { mockDoctors } from '../data/doctors';
import { mockHospitals } from '../data/hospitals';
import { mockLabTests } from '../data/labs';
import { mockMedications } from '../data/pharmacy';
import { mockAppointments } from '../data/appointments';

const BASE_URL = 'https://hackathon-api.aheadafrica.org';
const API_KEY = 'P3KLLW2JQ0:sVcgRNB7mwiZKir7lifSSTcpm2-14S3vZ9xJj_eQX2M';

// Helper to generate Auth headers
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${btoa(API_KEY)}`,
  };
};

// Helper to handle fetch with timeout and headers
const fetchWithTimeout = async (resource: string, options: RequestInit = {}) => {
  const { timeout = 15000, ...fetchOptions } = options as any;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const url = `${BASE_URL}${resource}`;
  
  try {
    console.log(`Fetching from API: ${url}`);
    const response = await fetch(url, {
      ...fetchOptions,
      mode: 'cors', // Explicitly request CORS
      headers: {
        ...getHeaders(),
        ...fetchOptions.headers,
      },
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    clearTimeout(id);
    throw error;
  }
};

export const api = {
  getSystemStatus: async (): Promise<string | null> => {
    try {
      const response = await fetchWithTimeout('/');
      // Try to parse JSON, if it fails return text, if that fails return null
      try {
         const data = await response.json();
         return data.message || JSON.stringify(data);
      } catch {
         return await response.text();
      }
    } catch (error) {
      console.warn('API System Check Failed', error);
      return null;
    }
  },

  getDoctors: async (): Promise<Doctor[]> => {
    try {
      const response = await fetchWithTimeout('/doctors');
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      const data = await response.json();
      console.log('Doctors Data:', data);
      
      return Array.isArray(data) ? data.map((item: any) => ({
        id: item.id || Math.floor(Math.random() * 10000),
        name: item.name || item.fullName || 'Unknown Doctor',
        specialty: item.specialty || 'General Practice',
        hospital: item.hospital || 'General Hospital',
        availability: Array.isArray(item.availability) ? item.availability : ['Mon', 'Wed', 'Fri'],
        imageUrl: item.imageUrl || item.image || `https://picsum.photos/seed/${item.id || 'doc'}/400/400`,
        yearsOfExperience: item.yearsOfExperience || 5,
        bio: item.bio || 'Dedicated healthcare professional committed to patient care.',
        consultationTypes: item.consultationTypes || ['Video Call', 'In-Person']
      })) : mockDoctors;
    } catch (error) {
      console.warn('Failed to fetch doctors from API, using offline data.', error);
      throw error; // Re-throw to trigger offline mode handling in App
    }
  },

  getHospitals: async (): Promise<Hospital[]> => {
    try {
      const response = await fetchWithTimeout('/hospitals');
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      const data = await response.json();
      console.log('Hospitals Data:', data);

      return Array.isArray(data) ? data.map((item: any) => ({
        id: item.id || Math.floor(Math.random() * 10000),
        name: item.name || 'Unknown Hospital',
        location: item.location || 'Metropolis',
        specialties: Array.isArray(item.specialties) ? item.specialties : ['General'],
        rating: typeof item.rating === 'number' ? item.rating : 4.5,
        imageUrl: item.imageUrl || `https://picsum.photos/seed/${item.id || 'hosp'}h/400/300`,
        services: Array.isArray(item.services) ? item.services : [
            { name: 'General Consultation', description: 'Standard medical checkup.' }
        ]
      })) : mockHospitals;
    } catch (error) {
      console.warn('Failed to fetch hospitals from API, using offline data.', error);
      throw error;
    }
  },

  getLabTests: async (): Promise<LabTest[]> => {
    try {
      const response = await fetchWithTimeout('/labs'); 
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      const data = await response.json();
      console.log('Labs Data:', data);

      return Array.isArray(data) ? data.map((item: any) => ({
        id: item.id || Math.floor(Math.random() * 10000),
        name: item.name || item.testName || 'General Lab Test',
        description: item.description || 'Diagnostic laboratory service.',
        price: typeof item.price === 'number' ? item.price : 50.00,
        requiresFasting: !!item.requiresFasting,
        category: item.category || 'General'
      })) : mockLabTests;
    } catch (error) {
      console.warn('Failed to fetch lab tests from API, using offline data.', error);
      throw error;
    }
  },

  getMedications: async (): Promise<Medication[]> => {
    try {
      const response = await fetchWithTimeout('/pharmacy'); 
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      const data = await response.json();
      console.log('Pharmacy Data:', data);

      return Array.isArray(data) ? data.map((item: any) => ({
        id: item.id || Math.floor(Math.random() * 10000),
        name: item.name || 'Unknown Medication',
        dosage: item.dosage || 'As directed',
        price: typeof item.price === 'number' ? item.price : 15.99,
        requiresPrescription: !!item.requiresPrescription,
        usageInstructions: item.usageInstructions || 'Follow doctor instructions.',
        sideEffects: Array.isArray(item.sideEffects) ? item.sideEffects : [],
        warnings: item.warnings || 'Keep out of reach of children.'
      })) : mockMedications;
    } catch (error) {
      console.warn('Failed to fetch medications from API, using offline data.', error);
      throw error;
    }
  },

  getAppointments: async (): Promise<Appointment[]> => {
    try {
      // List all appointments
      const response = await fetchWithTimeout('/v1/appointments');
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      const data = await response.json();
      console.log('Appointments List:', data);

      const results = data.results || [];
      return Array.isArray(results) ? results.map((item: any) => {
        const dateObj = new Date(item.date);
        const dateStr = dateObj.toLocaleDateString('en-CA');
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        // Fallback doctor since API list might be minimal
        const doctor = mockDoctors[item.id % mockDoctors.length] || mockDoctors[0];

        return {
            id: item.id,
            doctor: doctor,
            date: dateStr,
            time: timeStr,
            type: 'Video Call', 
            status: item.status === 'active' ? 'Upcoming' : 'Completed',
            reasonForVisit: item.reason || 'Consultation',
            consultationNotes: item.summary
        };
      }) : mockAppointments;
    } catch (error) {
      console.warn('Failed to fetch appointments from API, using offline data.', error);
      throw error;
    }
  },

  getAppointmentById: async (id: number): Promise<Appointment | null> => {
    try {
      // Retrieve a single appointment by ID
      const response = await fetchWithTimeout(`/v1/appointments/${id}`);
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      const item = await response.json();
      console.log(`Appointment ${id} Details:`, item);
      
      const dateObj = new Date(item.date);
      const dateStr = dateObj.toLocaleDateString('en-CA');
      const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      
      const doctor = mockDoctors[item.id % mockDoctors.length] || mockDoctors[0];

      return {
          id: item.id,
          doctor: doctor,
          date: dateStr,
          time: timeStr,
          type: 'Video Call',
          status: item.status === 'active' ? 'Upcoming' : 'Completed',
          reasonForVisit: item.reason || 'No specific reason provided',
          consultationNotes: item.summary || '' // Map 'summary' from API to our consultationNotes
      };
    } catch (error) {
      console.error(`Failed to fetch appointment ${id}:`, error);
      return null;
    }
  },

  getPatientMedicationRecords: async (): Promise<MedicationRecord[]> => {
    try {
      const response = await fetchWithTimeout('/v1/medications');
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      const data = await response.json();
      console.log('Patient Medication Records:', data);
      return data.results || [];
    } catch (error) {
      console.warn('Failed to fetch patient medication records:', error);
      return [];
    }
  },

  createAIAppointment: async (prompt: string): Promise<{status: boolean, status_code: number, message: string, id: number}> => {
    try {
      const response = await fetchWithTimeout('/ai-appointments', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to create AI appointment:', error);
      throw error;
    }
  },

  createAIPatient: async (prompt: string): Promise<{status: boolean, status_code: number, message: string, id: number}> => {
    try {
      const response = await fetchWithTimeout('/ai-patients', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to create AI patient:', error);
      throw error;
    }
  },

  createAIEMR: async (prompt: string, patientId: number): Promise<{
    status: boolean;
    status_code: number;
    message: string;
    resource: string;
    available_pharmacies: { pharmacy_name: string; medications: { name: string; price: number }[] }[];
  }> => {
    try {
        const response = await fetchWithTimeout('/ai-emr', {
            method: 'POST',
            body: JSON.stringify({ prompt, patient: patientId }),
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to create AI EMR:', error);
        throw error;
    }
  }
};
