export interface VitalData {
  _time: string;
  _value: number;
  type: string;
  bed: string;
  unit: string;
  isExtreme: boolean;
  systolic?: number;    // 收缩压
  diastolic?: number;   // 舒张压
}

export interface ChartDataPoint {
  time: string;
  value: number;
  original: VitalData;
}

export interface QueryParams {
  dateRange: DateRange;
  vitalSign: string;
  bedNumber: string;
  findExtremes?: boolean;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}