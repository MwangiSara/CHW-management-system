import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const RequestsChart = ({ stats }) => {
  const data = [
    { name: "Pending", value: stats.pending_requests, color: "#f59e0b" },
    { name: "Approved", value: stats.approved_requests, color: "#10b981" },
    { name: "Rejected", value: stats.rejected_requests, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Request Status Distribution
      </h2>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No requests to display
        </div>
      )}
    </div>
  );
};

export default RequestsChart;
