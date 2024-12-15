export interface EditVitalData {
  _time: string;
  _value: number;
  systolic?: number;
  diastolic?: number;
  unit: string;
  bed: string;
  type: string;
}

export interface DeleteOperation {
  time: string;
  type: string;
  bed: string;
}
