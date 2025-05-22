import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { commoditiesAPI, requestsAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

const RequestForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    commodity: "",
    quantity_requested: "",
    reason_for_request: "",
  });

  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCommodities();
  }, []);

  const fetchCommodities = async () => {
    try {
      const response = await commoditiesAPI.getAll();
      // console.log("Commodity API response:", response.data.results);
      setCommodities(response.data.results);
    } catch (err) {
      setError("Failed to load commodities");
      console.error("Error fetching commodities:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.commodity || !formData.quantity_requested) {
      setError("Please fill in all required fields");
      return;
    }

    const quantity = parseInt(formData.quantity_requested);
    if (isNaN(quantity) || quantity < 1 || quantity > 99) {
      setError("Quantity must be a whole number between 1 and 99");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await requestsAPI.create({
        ...formData,
        quantity_requested: quantity,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/requests");
      }, 2000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Failed to submit request";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCommodity = commodities.find((c) => c.id == formData.commodity);

  if (loading) return <LoadingSpinner text="Loading commodities..." />;

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Request Submitted!
        </h2>
        <p className="text-gray-600 mb-4">
          Your commodity request has been sent for approval.
        </p>
        <p className="text-sm text-gray-500">Redirecting to your requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            New Commodity Request
          </h1>
          <p className="mt-1 text-gray-600">
            Request commodities from your supervising CHA:{" "}
            {user.supervisor_name}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Commodity Selection */}
          <div>
            <label htmlFor="commodity" className="label">
              Commodity <span className="text-red-500">*</span>
            </label>
            <select
              id="commodity"
              name="commodity"
              value={formData.commodity}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select a commodity</option>
              {commodities.map((commodity) => (
                <option key={commodity.id} value={commodity.id}>
                  {commodity.name} ({commodity.unit_of_measure})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity_requested" className="label">
              Quantity Requested <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="quantity_requested"
              name="quantity_requested"
              min="1"
              max={selectedCommodity?.max_quantity_per_request || 99}
              value={formData.quantity_requested}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter quantity"
              required
            />
            {selectedCommodity && (
              <p className="mt-1 text-sm text-gray-500">
                Maximum {selectedCommodity.max_quantity_per_request}{" "}
                {selectedCommodity.unit_of_measure} per request
                <br />
                Monthly limit: {selectedCommodity.max_monthly_allocation}{" "}
                {selectedCommodity.unit_of_measure}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reason_for_request" className="label">
              Reason for Request
            </label>
            <textarea
              id="reason_for_request"
              name="reason_for_request"
              rows={4}
              value={formData.reason_for_request}
              onChange={handleChange}
              className="input-field"
              placeholder="Explain why you need these commodities (optional)"
            />
          </div>

          {/* Important Notes */}
          <div className="bg-primary-50 border border-primary-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-primary-800 mb-2">
              Important Notes:
            </h3>
            <ul className="text-sm text-primary-700 space-y-1">
              <li>• Only one request per commodity per day is allowed</li>
              <li>• Maximum 200 units per commodity per month</li>
              <li>• Your CHA will review and approve your request</li>
              <li>• You'll be notified once your request is processed</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/requests")}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  Submitting...
                </div>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;
