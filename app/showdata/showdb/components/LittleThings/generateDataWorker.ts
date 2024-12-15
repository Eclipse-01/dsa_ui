import { generateTestData, calculateTotalDataPoints } from './generateTestData';
import { clearCache } from './influxService';

self.onmessage = async (e) => {
  const { config, batchSize } = e.data;
  let totalGenerated = 0;
  const totalDataPoints = calculateTotalDataPoints(config);
  const totalTasks = Math.ceil(totalDataPoints / 1000000);

  // 发送初始进度信息
  self.postMessage({ type: 'init', totalDataPoints, totalTasks });

  for (let task = 1; task <= totalTasks; task++) {
    let taskGenerated = 0;
    const taskStartDate = new Date(config.startDate);
    taskStartDate.setTime(taskStartDate.getTime() + (task - 1) * 1000000 * config.interval * 60 * 1000);
    const taskEndDate = new Date(taskStartDate);
    taskEndDate.setTime(Math.min(taskEndDate.getTime() + 1000000 * config.interval * 60 * 1000, new Date(config.endDate).getTime()));

    const taskConfig = { ...config, startDate: taskStartDate, endDate: taskEndDate };

    for await (const batch of generateTestData(taskConfig, batchSize, (progress) => {
      taskGenerated = progress * 10000; // 1000000 / 100
      const overallProgress = (totalGenerated + taskGenerated) / totalDataPoints * 100;
      self.postMessage({ 
        type: 'progress', 
        progress: overallProgress, 
        generated: totalGenerated + taskGenerated, 
        total: totalDataPoints 
      });
      self.postMessage({ 
        type: 'taskProgress', 
        progress: progress, 
        currentTask: task, 
        totalTasks 
      });
    })) {
      self.postMessage({ type: 'batch', data: batch });
    }

    totalGenerated += taskGenerated;

    // 清除缓存
    await clearCache();
  }

  self.postMessage({ type: 'complete', totalGenerated, totalDataPoints });
};
