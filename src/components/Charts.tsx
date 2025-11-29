import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BRAND_COLORS } from '../constants/colors';

interface ChartsProps {
  data: {
    daily: Array<{ date: string; arrived: number; picked: number }>;
    byCourier: Array<{ name: string; value: number }>;
    bySize: Array<{ name: string; value: number }>;
  };
}

const Charts: React.FC<ChartsProps> = ({ data }) => {
  const COLORS = [
    BRAND_COLORS.primary[500],
    BRAND_COLORS.primary[400],
    BRAND_COLORS.primary[300],
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Line Chart - Daily Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Trend Paket Harian</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickLine={{ stroke: '#CBD5E1' }}
            />
            <YAxis 
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickLine={{ stroke: '#CBD5E1' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
            />
            <Line 
              type="monotone" 
              dataKey="arrived" 
              stroke={BRAND_COLORS.primary[500]} 
              strokeWidth={3}
              name="Paket Masuk"
              dot={{ fill: BRAND_COLORS.primary[500], r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="picked" 
              stroke="#10B981" 
              strokeWidth={3}
              name="Paket Diambil"
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - By Courier */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Paket per Kurir</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.byCourier}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickLine={{ stroke: '#CBD5E1' }}
            />
            <YAxis 
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickLine={{ stroke: '#CBD5E1' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Bar 
              dataKey="value" 
              fill={BRAND_COLORS.primary[500]}
              radius={[8, 8, 0, 0]}
              name="Jumlah Paket"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - By Size */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Distribusi Ukuran Paket</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.bySize}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.bySize.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
