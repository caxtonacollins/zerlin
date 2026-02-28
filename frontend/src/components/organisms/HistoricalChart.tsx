'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/atoms';

interface HistoricalChartProps {
  data?: Array<{ timestamp: string; fee: number }>;
}

export function HistoricalChart({ data = [] }: HistoricalChartProps) {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(7);

  // Mock data for demonstration
  const mockData = [
    { timestamp: 'Feb 20', fee: 0.00018 },
    { timestamp: 'Feb 21', fee: 0.00022 },
    { timestamp: 'Feb 22', fee: 0.00019 },
    { timestamp: 'Feb 23', fee: 0.00025 },
    { timestamp: 'Feb 24', fee: 0.00021 },
    { timestamp: 'Feb 25', fee: 0.00017 },
    { timestamp: 'Feb 26', fee: 0.00020 },
    { timestamp: 'Feb 27', fee: 0.00018 },
  ];

  const chartData = data.length > 0 ? data : mockData;

  return (
    <div className="w-full p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-text-primary">Fee History</h3>
        
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={timeRange === 7 ? 'primary' : 'ghost'}
            onClick={() => setTimeRange(7)}
          >
            7D
          </Button>
          <Button
            size="sm"
            variant={timeRange === 30 ? 'primary' : 'ghost'}
            onClick={() => setTimeRange(30)}
          >
            30D
          </Button>
          <Button
            size="sm"
            variant={timeRange === 90 ? 'primary' : 'ghost'}
            onClick={() => setTimeRange(90)}
          >
            90D
          </Button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#6A6A6A"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6A6A6A"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `${value} STX`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #2A2A2A',
                borderRadius: '8px',
                color: '#FAFAFA',
              }}
              formatter={(value) => [`${value || 0} STX`, 'Fee']}
            />
            <Line 
              type="monotone" 
              dataKey="fee" 
              stroke="#5546FF" 
              strokeWidth={2}
              dot={{ fill: '#5546FF', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-sm text-text-secondary mb-1">Average</div>
          <div className="text-lg font-semibold text-text-primary">0.00020 STX</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-text-secondary mb-1">Lowest</div>
          <div className="text-lg font-semibold text-success">0.00017 STX</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-text-secondary mb-1">Highest</div>
          <div className="text-lg font-semibold text-error">0.00025 STX</div>
        </div>
      </div>
    </div>
  );
}
