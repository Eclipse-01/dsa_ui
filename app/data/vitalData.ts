import vitalDataJson from './vitalData.json'

export type VitalData = {
  id: number;
  timestamp: string;
  type: string;
  value: string;
  unit: string;
  selected?: boolean;
}

export const vitalDataList: VitalData[] = vitalDataJson.vitalDataList
