import React from "react";

const AllocationStatus = ({ allocation }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Monthly Allocation Status
      </h2>

      <div className="space-y-4">
        {allocation.map((item) => (
          <div
            key={item.commodity_id}
            className="flex items-center justify-between"
          >
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                {item.commodity_name}
              </h3>
              <div className="mt-1 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.percentage_used >= 90
                        ? "bg-red-500"
                        : item.percentage_used >= 70
                        ? "bg-yellow-500"
                        : "bg-primary-500"
                    }`}
                    style={{ width: `${Math.min(item.percentage_used, 100)}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-gray-500">
                  {item.percentage_used.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="ml-4 text-right">
              <div className="text-sm font-medium text-gray-900">
                {item.used} / {item.max_allocation}
              </div>
              <div className="text-xs text-gray-500">
                {item.remaining} remaining
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllocationStatus;
