import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Card } from 'antd';

interface ChartWrapperProps {
  title: string;
  option: echarts.EChartsOption;
  height?: number;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({ 
  title, 
  option, 
  height = 400 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      // Khởi tạo chart
      chartInstance.current = echarts.init(chartRef.current);
      chartInstance.current.setOption(option);
      
      // Resize handler
      const handleResize = () => {
        chartInstance.current?.resize();
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance.current?.dispose();
      };
    }
  }, []);
  
  useEffect(() => {
    // Update chart khi option thay đổi
    if (chartInstance.current) {
      chartInstance.current.setOption(option, true);
    }
  }, [option]);
  
  return (
    <Card title={title} size="small">
      <div 
        ref={chartRef} 
        style={{ width: '100%', height: `${height}px` }}
      />
    </Card>
  );
};
