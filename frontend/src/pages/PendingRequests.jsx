import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { requestsAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ApprovalModal from "../components/requests/ApprovalModal";

const PendingRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await requestsAPI.getPending();
      setRequests(response.data.results || response.data);
    } catch (err) {
      setError("Failed to load pending requests");
      console.error("Error fetching pending requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const handleApprovalComplete = () => {
    setModalOpen(false);
    setSelectedRequest(null);
    fetchPendingRequests(); // Refresh the list
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <LoadingSpinner text="Loading pending requests..." />;
  if (error) return <div className="text-red-600 text-center p-4">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="mt-1 text-gray-600">
          Review and approve commodity requests from your CHWs
        </p>
      </div>

      {/* Pending Requests */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {requests.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {requests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {request.commodity_name}
                      </h3>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Requester:</span>{" "}
                        {request.requester_name}
                      </div>
                      <div>
                        <span className="font-medium">Quantity:</span>{" "}
                        {request.quantity_requested} {request.commodity_unit}
                      </div>
                      <div>
                        <span className="font-medium">Requested:</span>{" "}
                        {formatDate(request.created_at)}
                      </div>
                    </div>

                    {request.reason_for_request && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700">
                          Reason:
                        </span>
                        <p className="text-sm text-gray-600">
                          {request.reason_for_request}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-6">
                    <button
                      onClick={() => handleApproval(request)}
                      className="btn-primary"
                    >
                      Review Request
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No pending requests
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              All requests have been processed.
            </p>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {selectedRequest && (
        <ApprovalModal
          request={selectedRequest}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onComplete={handleApprovalComplete}
        />
      )}
    </div>
  );
};

export default PendingRequests;
