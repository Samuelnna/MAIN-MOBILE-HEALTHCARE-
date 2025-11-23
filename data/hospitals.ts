import type { Hospital } from '../types';

export const mockHospitals: Hospital[] = [
  { 
    id: 1, name: 'City General Hospital', location: 'Metropolis', specialties: ['Cardiology', 'Neurology', 'Oncology'], rating: 4.8, imageUrl: 'https://picsum.photos/seed/hospital1/400/300',
    services: [
      { name: 'Cardiac Stress Test', description: 'Evaluates heart function during physical activity.' },
      { name: 'MRI Scan', description: 'Detailed imaging for neurological conditions.' },
      { name: 'Chemotherapy', description: 'Cancer treatment using powerful chemical drugs.' }
    ]
  },
  { 
    id: 2, name: 'St. Jude\'s Medical Center', location: 'Star City', specialties: ['Pediatrics', 'Orthopedics'], rating: 4.9, imageUrl: 'https://picsum.photos/seed/hospital2/400/300',
    services: [
      { name: 'Childhood Vaccinations', description: 'Standard immunizations for children.' },
      { name: 'Joint Replacement Surgery', description: 'Surgical procedure to replace a damaged joint.' },
      { name: 'Sports Injury Clinic', description: 'Specialized care for athletic injuries.' }
    ]
  },
  { 
    id: 3, name: 'Oceanview Clinic', location: 'Coastline', specialties: ['Dermatology', 'General Practice'], rating: 4.6, imageUrl: 'https://picsum.photos/seed/clinic1/400/300',
    services: [
      { name: 'Annual Physical Exams', description: 'Comprehensive check-up for general health.' },
      { name: 'Skin Cancer Screening', description: 'Examination of the skin for signs of cancer.' }
    ]
  },
  { 
    id: 4, name: 'Mountain Crest Hospital', location: 'Pine Valley', specialties: ['Trauma', 'Emergency Medicine'], rating: 4.7, imageUrl: 'https://picsum.photos/seed/hospital3/400/300',
    services: [
      { name: '24/7 Emergency Room', description: 'Immediate care for urgent medical conditions.' },
      { name: 'Trauma Surgery', description: 'Surgical care for critically injured patients.' }
    ]
  },
  { 
    id: 5, name: 'Sunrise Wellness Center', location: 'Metropolis', specialties: ['Mental Health', 'Rehabilitation'], rating: 4.9, imageUrl: 'https://picsum.photos/seed/wellness1/400/300',
    services: [
      { name: 'Inpatient Psychiatry', description: 'Hospital-based mental health treatment.' },
      { name: 'Physical Therapy', description: 'Rehabilitation to improve movement and manage pain.' },
      { name: 'Addiction Services', description: 'Support and treatment for substance use disorders.' }
    ]
  },
  { 
    id: 6, name: 'Community Care Hospital', location: 'Star City', specialties: ['Geriatrics', 'Family Medicine'], rating: 4.5, imageUrl: 'https://picsum.photos/seed/hospital4/400/300',
    services: [
      { name: 'Geriatric Assessment', description: 'Comprehensive evaluation for older adults.' },
      { name: 'Chronic Disease Management', description: 'Ongoing care for conditions like diabetes and hypertension.' }
    ]
  },
  { 
    id: 7, name: 'Riverbend Regional', location: 'Riverdale', specialties: ['Urology', 'Endocrinology'], rating: 4.7, imageUrl: 'https://picsum.photos/seed/hospital5/400/300',
    services: [
      { name: 'Kidney Stone Treatment', description: 'Medical and surgical options for kidney stones.' },
      { name: 'Diabetes Care Center', description: 'Comprehensive management of diabetes.' }
    ]
  },
  { 
    id: 8, name: 'North Valley Surgical', location: 'Pine Valley', specialties: ['Surgery', 'Anesthesiology'], rating: 4.8, imageUrl: 'https://picsum.photos/seed/surgical1/400/300',
    services: [
      { name: 'Minimally Invasive Surgery', description: 'Surgical procedures performed through small incisions.' },
      { name: 'Pain Management Services', description: 'Anesthesia and pain relief for surgical patients.' }
    ]
  },
  { 
    id: 9, name: 'Bayfront Medical', location: 'Coastline', specialties: ['Pulmonology', 'Gastroenterology'], rating: 4.6, imageUrl: 'https://picsum.photos/seed/medical1/400/300',
    services: [
      { name: 'Pulmonary Function Testing', description: 'Measures lung function.' },
      { name: 'Endoscopy & Colonoscopy', description: 'Procedures to examine the digestive tract.' }
    ]
  },
  { 
    id: 10, name: 'Grand Oak Hospital', location: 'Metropolis', specialties: ['Cardiology', 'Internal Medicine'], rating: 4.9, imageUrl: 'https://picsum.photos/seed/hospital6/400/300',
    services: [
      { name: 'Echocardiogram', description: 'Ultrasound imaging of the heart.' },
      { name: 'Preventive Health Screenings', description: 'Tests to detect health problems early.' }
    ]
  },
  { 
    id: 11, name: 'Lakeside Children\'s', location: 'Riverdale', specialties: ['Pediatrics', 'Neonatology'], rating: 4.9, imageUrl: 'https://picsum.photos/seed/childrens1/400/300',
    services: [
      { name: 'Neonatal Intensive Care (NICU)', description: 'Specialized care for newborns.' },
      { name: 'Pediatric Specialty Clinics', description: 'Focused care for various childhood conditions.' }
    ]
  },
  { 
    id: 12, name: 'Evergreen Health', location: 'Pine Valley', specialties: ['Oncology', 'Hematology'], rating: 4.8, imageUrl: 'https://picsum.photos/seed/health1/400/300',
    services: [
      { name: 'Radiation Therapy', description: 'Cancer treatment using high-energy rays.' },
      { name: 'Blood Disorder Treatment', description: 'Care for conditions like anemia and hemophilia.' }
    ]
  },
  { 
    id: 13, name: 'Westside Urgent Care', location: 'Star City', specialties: ['Emergency Medicine', 'Family Medicine'], rating: 4.4, imageUrl: 'https://picsum.photos/seed/urgentcare1/400/300',
    services: [
      { name: 'Urgent Injury Care', description: 'Treatment for non-life-threatening injuries.' },
      { name: 'Flu Shots & Vaccinations', description: 'Immunizations for common illnesses.' }
    ]
  },
  { 
    id: 14, name: 'Central Dermatology', location: 'Metropolis', specialties: ['Dermatology', 'Cosmetic Surgery'], rating: 4.7, imageUrl: 'https://picsum.photos/seed/dermatology1/400/300',
    services: [
      { name: 'Acne Treatment Programs', description: 'Personalized plans for managing acne.' },
      { name: 'Laser Skin Procedures', description: 'Cosmetic treatments using laser technology.' }
    ]
  },
  { 
    id: 15, name: 'South Point Rehab', location: 'Coastline', specialties: ['Rehabilitation', 'Physical Therapy'], rating: 4.5, imageUrl: 'https://picsum.photos/seed/rehab1/400/300',
    services: [
      { name: 'Post-Surgical Rehabilitation', description: 'Therapy to aid recovery after surgery.' },
      { name: 'Occupational Therapy', description: 'Helps patients return to daily activities.' }
    ]
  },
];