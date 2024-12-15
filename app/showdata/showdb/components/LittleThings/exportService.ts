import { VitalData } from "../../types"

export const exportToCSV = (data: VitalData[], filename: string) => {
  const headers = ['时间', '数值', '单位', '床位', '指标类型'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row._time,
      row.type === '血压' ? `${row.systolic}/${row.diastolic}` : row._value,
      row.unit,
      row.bed,
      row.type
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};
