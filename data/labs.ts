import type { LabTest } from '../types';

export const mockLabTests: LabTest[] = [
  { id: 1, name: 'Complete Blood Count (CBC)', description: 'Evaluates your overall health and detects a wide range of disorders.', price: 75, requiresFasting: false, category: 'Blood Work' },
  { id: 2, name: 'Basic Metabolic Panel (BMP)', description: 'Measures glucose, calcium, and electrolytes.', price: 120, requiresFasting: true, category: 'Blood Work' },
  { id: 3, name: 'Lipid Panel', description: 'Measures cholesterol and triglycerides in your blood.', price: 90, requiresFasting: true, category: 'Cardiology' },
  { id: 4, name: 'Thyroid Panel (TSH)', description: 'Checks for thyroid gland problems.', price: 150, requiresFasting: false, category: 'Blood Work' },
  { id: 5, name: 'MRI Scan (Brain)', description: 'Detailed imaging of the brain and surrounding nerve tissues.', price: 850, requiresFasting: false, category: 'Imaging' },
  { id: 6, name: 'CT Scan (Abdomen)', description: 'Provides detailed cross-sectional images of abdominal organs.', price: 600, requiresFasting: true, category: 'Imaging' },
  { id: 7, name: 'Comprehensive Metabolic Panel (CMP)', description: 'A more detailed version of the BMP, also checking liver and kidney function.', price: 160, requiresFasting: true, category: 'Blood Work' },
  { id: 8, name: 'Urinalysis', description: 'Checks for a variety of disorders, such as urinary tract infections, kidney disease, and diabetes.', price: 50, requiresFasting: false, category: 'General' },
  { id: 9, name: 'Chest X-Ray', description: 'Produces images of the heart, lungs, airways, blood vessels and bones of the chest.', price: 220, requiresFasting: false, category: 'Imaging' },
  { id: 10, name: 'Electrocardiogram (ECG)', description: 'Records the electrical signal from the heart to check for different heart conditions.', price: 180, requiresFasting: false, category: 'Cardiology' },
  { id: 11, name: 'C-Reactive Protein (CRP) Test', description: 'Measures the level of CRP, a marker for inflammation in the body.', price: 55, requiresFasting: false, category: 'Blood Work' },
  { id: 12, name: 'Sexually Transmitted Disease (STD) Panel', description: 'Screens for common STDs.', price: 250, requiresFasting: false, category: 'General' },
  { id: 13, name: 'Allergy Testing Panel', description: 'Tests for common allergens like pollen, mold, and pet dander.', price: 350, requiresFasting: false, category: 'General' },
  { id: 14, name: 'Liver Enzyme Test (ALT & AST)', description: 'Checks for liver damage or disease.', price: 95, requiresFasting: false, category: 'Blood Work' },
  { id: 15, name: 'Kidney Function Test (Creatinine)', description: 'Evaluates how well the kidneys are working.', price: 80, requiresFasting: false, category: 'Blood Work' },
];