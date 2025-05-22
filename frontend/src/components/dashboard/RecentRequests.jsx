import React from "react";
import { Link } from "react-router-dom";

const RecentRequests = ({ requests }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "DELIVERED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Recent Requests</h2>
        <Link
          to="/requests"
          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
        >
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {request.commodity_name}
                </h3>
                <p className="text-xs text-gray-500">
                  Qty: {request.quantity_requested} •{" "}
                  {formatDate(request.created_at)}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  request.status
                )}`}
              >
                {request.status_display}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">
            No recent requests
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentRequests;
