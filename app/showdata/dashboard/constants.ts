export const VITAL_RANGES = {
  heartRate: { min: 60, max: 100, unit: 'BPM' },
  bloodO2: { min: 95, max: 100, unit: '%' },
  systolic: { min: 90, max: 140, unit: 'mmHg' },
  diastolic: { min: 60, max: 90, unit: 'mmHg' },
  temperature: { min: 36.1, max: 37.2, unit: '°C' },
  respirationRate: { min: 12, max: 20, unit: '次/分' },
  bloodGlucose: { min: 3.9, max: 6.1, unit: 'mmol/L' },
  heartRateVariability: { min: 20, max: 200, unit: 'ms' },
  stressLevel: { min: 1, max: 3, unit: '/5' }
}
