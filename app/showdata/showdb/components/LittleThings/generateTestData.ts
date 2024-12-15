interface GenerateConfig {
  startDate: Date;
  endDate: Date;
  type: string;
  bedNumber: string;
  interval?: number; // 数据间隔(分钟)，默认5分钟
}

const getRandomValue = (type: string): number => {
  const ranges: Record<string, [number, number]> = {
    '心率': [60, 100],
    '血氧饱和度': [95, 100],
    '血压': [90, 140],
    '体温': [36, 37.5],
    '呼吸率': [12, 20],
    '血糖': [4, 7],
    '心率变异性': [20, 100],
    '压力水平': [1, 5],
  };

  const [min, max] = ranges[type] || [0, 100];
  return Number((Math.random() * (max - min) + min).toFixed(2));
};

const getUnit = (type: string): string => {
  const units: Record<string, string> = {
    '心率': 'BPM',
    '血氧饱和度': '%',
    '血压': 'mmHg',
    '体温': '°C',
    '呼吸率': '次/分',
    '血糖': 'mmol/L',
    '心率变异性': 'ms',
    '压力水平': '级',
  };
  return units[type] || '';
};

export const calculateTotalDataPoints = (config: GenerateConfig): number => {
  const { startDate, endDate, interval = 5 } = config;
  const totalDuration = endDate.getTime() - startDate.getTime();
  return Math.ceil(totalDuration / (interval * 60 * 1000)) + 1; // +1 to include both start and end points
};

export const generateTestData = async function* (
  config: GenerateConfig, 
  batchSize: number = 1000,
  onProgress?: (progress: number) => void
) {
  const { startDate, endDate, type, bedNumber, interval = 5 } = config;
  let currentDate = new Date(startDate);
  const totalDuration = endDate.getTime() - startDate.getTime();
  let batchData = [];
  let totalGenerated = 0;

  while (currentDate <= endDate) {
    batchData.push({
      _time: currentDate.toISOString(),
      _value: getRandomValue(type),
      unit: getUnit(type),
      bed: `${bedNumber}号床`,
      type: type,
    });
    totalGenerated++;

    if (batchData.length >= batchSize) {
      yield batchData;
      if (onProgress) {
        onProgress((totalGenerated / (totalDuration / (interval * 60 * 1000))) * 100);
      }
      batchData = [];
    }
    
    currentDate.setTime(currentDate.getTime() + interval * 60 * 1000);
  }

  if (batchData.length > 0) {
    yield batchData;
    if (onProgress) {
      onProgress(100);
    }
  }
};
