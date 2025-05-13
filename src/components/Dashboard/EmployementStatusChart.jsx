import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const EmploymentStatusChart = ({ residents }) => {
  const data = [
    { name: 'Employed', value: residents.filter(r => r.employmentStatus === 'Employed').length },
    { name: 'Unemployed', value: residents.filter(r => r.employmentStatus === 'Unemployed').length },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Employment Status Distribution</h3>
      <BarChart width={400} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#82ca9d" />
      </BarChart>
    </div>
  );
};

export default EmploymentStatusChart;