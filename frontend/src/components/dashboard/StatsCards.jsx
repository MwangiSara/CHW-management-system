import React from "react";
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

const StatsCards = ({ stats, userRole }) => {
  const cards = [
    {
      name: "Total Requests",
      value: stats.total_requests,
      icon: DocumentTextIcon,
      color: "bg-primary-500",
    },
    {
      name: "Pending",
      value: stats.pending_requests,
      icon: ClockIcon,
      color: "bg-yellow-500",
    },
    {
      name: "Approved",
      value: stats.approved_requests,
      icon: CheckCircleIcon,
      color: "bg-green-500",
    },
    {
      name: "Rejected",
      value: stats.rejected_requests,
      icon: XCircleIcon,
      color: "bg-red-500",
    },
    {
      name: "This Month",
      value: stats.monthly_requests,
      icon: CalendarIcon,
      color: "bg-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card) => (
        <div
          key={card.name}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`${card.color} rounded-md p-3`}>
                  <card.icon
                    className="h-6 w-6 text-white"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {card.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {card.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
