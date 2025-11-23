import type { Medication } from '../types';

export const mockMedications: Medication[] = [
  { 
    id: 1, name: 'Amoxicillin', dosage: '500mg', price: 25.50, requiresPrescription: true,
    usageInstructions: "Take one capsule every 8 hours with a full glass of water. Complete the full course of antibiotics even if you feel better.",
    sideEffects: ["Nausea", "Vomiting", "Diarrhea", "Rash"],
    warnings: "Do not take if you have a known allergy to penicillin. Seek immediate medical attention for severe allergic reactions."
  },
  { 
    id: 2, name: 'Ibuprofen', dosage: '200mg', price: 9.99, requiresPrescription: false,
    usageInstructions: "Take 1-2 tablets every 4-6 hours as needed for pain. Do not exceed 6 tablets in 24 hours. Take with food or milk to prevent stomach upset.",
    sideEffects: ["Stomach pain", "Heartburn", "Nausea", "Dizziness"],
    warnings: "May increase the risk of heart attack or stroke. Do not use right before or after heart surgery. Avoid if you have a history of stomach ulcers or bleeding."
  },
  { 
    id: 3, name: 'Lisinopril', dosage: '10mg', price: 15.00, requiresPrescription: true,
    usageInstructions: "Take one tablet by mouth once daily, at the same time each day. May be taken with or without food.",
    sideEffects: ["Dizziness", "Lightheadedness", "Dry cough", "Headache"],
    warnings: "Do not use if you are pregnant. If you become pregnant, stop taking this medicine and tell your doctor right away. May cause a serious allergic reaction (angioedema)."
  },
  { 
    id: 4, name: 'Metformin', dosage: '1000mg', price: 30.20, requiresPrescription: true,
    usageInstructions: "Take with meals to help reduce stomach upset. Swallow the tablet whole; do not crush, chew, or break it.",
    sideEffects: ["Nausea", "Vomiting", "Stomach upset", "Diarrhea", "Metallic taste"],
    warnings: "Rarely, may cause a serious condition called lactic acidosis. Get emergency medical help if you have unusual muscle pain, trouble breathing, or feel very weak."
  },
  { 
    id: 5, name: 'Cetirizine (Zyrtec)', dosage: '10mg', price: 18.75, requiresPrescription: false,
    usageInstructions: "Take one tablet once daily. Do not take more than one tablet in 24 hours.",
    sideEffects: ["Drowsiness", "Tiredness", "Dry mouth"],
    warnings: "Use caution when driving or operating machinery until you know how this drug affects you. Alcohol may increase drowsiness."
  },
  { 
    id: 6, name: 'Atorvastatin (Lipitor)', dosage: '20mg', price: 45.00, requiresPrescription: true,
    usageInstructions: "Take once daily in the evening, with or without food. Follow a cholesterol-lowering diet plan.",
    sideEffects: ["Joint pain", "Diarrhea", "Pain in arms or legs"],
    warnings: "Can cause serious muscle problems. Tell your doctor right away if you have unexplained muscle pain, tenderness, or weakness, especially if you also have a fever."
  },
  {
    id: 7, name: 'Omeprazole (Prilosec)', dosage: '20mg', price: 22.40, requiresPrescription: false,
    usageInstructions: "Take one capsule before a meal, once a day. Do not take for more than 14 days in a row without consulting a doctor.",
    sideEffects: ["Headache", "Stomach pain", "Gas"],
    warnings: "May increase the risk of bone fractures in the hip, wrist, or spine with long-term use or high doses."
  },
  {
    id: 8, name: 'Albuterol Inhaler', dosage: '90mcg', price: 55.00, requiresPrescription: true,
    usageInstructions: "Inhale 2 puffs every 4-6 hours as needed for wheezing or shortness of breath. Shake well before use.",
    sideEffects: ["Nervousness", "Shakiness", "Headache", "Throat irritation"],
    warnings: "Overuse may be a sign of worsening asthma. Seek medical attention if the inhaler does not provide relief."
  },
  {
    id: 9, name: 'Losartan', dosage: '50mg', price: 19.80, requiresPrescription: true,
    usageInstructions: "Take one tablet daily. Can be taken with or without food. Used to treat high blood pressure.",
    sideEffects: ["Dizziness", "Tiredness", "Nasal congestion"],
    warnings: "Do not use if pregnant. Can cause injury or death to the unborn baby."
  },
  {
    id: 10, name: 'Gabapentin', dosage: '300mg', price: 35.10, requiresPrescription: true,
    usageInstructions: "Take as directed by your doctor, usually three times a day. Used to treat nerve pain and seizures.",
    sideEffects: ["Drowsiness", "Dizziness", "Loss of coordination"],
    warnings: "Do not stop taking suddenly without consulting your doctor. May cause suicidal thoughts in rare cases."
  },
  {
    id: 11, name: 'Aspirin', dosage: '81mg', price: 7.50, requiresPrescription: false,
    usageInstructions: "Take one tablet daily for cardiovascular protection, or as directed by a doctor.",
    sideEffects: ["Upset stomach", "Heartburn"],
    warnings: "Can cause stomach bleeding. Do not give to children or teenagers with flu-like symptoms due to risk of Reye's syndrome."
  },
  {
    id: 12, name: 'Furosemide (Lasix)', dosage: '40mg', price: 12.00, requiresPrescription: true,
    usageInstructions: "Take once or twice daily as directed. It is a diuretic ('water pill') used to reduce extra fluid in the body.",
    sideEffects: ["Dizziness", "Increased urination", "Dehydration"],
    warnings: "Can cause a serious loss of body water and minerals. Follow your doctor's instructions closely."
  },
  {
    id: 13, name: 'Sertraline (Zoloft)', dosage: '50mg', price: 28.90, requiresPrescription: true,
    usageInstructions: "Take once daily, in the morning or evening. Used to treat depression, anxiety, and other disorders.",
    sideEffects: ["Nausea", "Insomnia", "Dry mouth", "Drowsiness"],
    warnings: "May increase risk of suicidal thinking and behavior in young adults. Do not stop taking abruptly."
  },
  {
    id: 14, name: 'Diphenhydramine (Benadryl)', dosage: '25mg', price: 8.99, requiresPrescription: false,
    usageInstructions: "Take every 4-6 hours for allergy symptoms. Can cause marked drowsiness.",
    sideEffects: ["Drowsiness", "Dizziness", "Constipation", "Blurred vision"],
    warnings: "Avoid alcoholic drinks. Be careful if you drive or do anything that requires you to be alert."
  },
  {
    id: 15, name: 'Tamsulosin (Flomax)', dosage: '0.4mg', price: 42.00, requiresPrescription: true,
    usageInstructions: "Take one capsule daily, approximately 30 minutes after the same meal each day. Used to treat an enlarged prostate.",
    sideEffects: ["Dizziness", "Lightheadedness", "Ejaculation problems"],
    warnings: "May cause a sudden drop in blood pressure, especially when first starting the medication."
  }
];
