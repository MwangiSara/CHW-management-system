import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { requestsAPI } from "../../services/api";
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const ApprovalModal = ({ request, open, onClose, onComplete }) => {
  const [action, setAction] = useState("");
  const [quantityApproved, setQuantityApproved] = useState(
    request.quantity_requested
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!action) {
      setError("Please select an action");
      return;
    }

    if (action === "APPROVED" && (!quantityApproved || quantityApproved < 1)) {
      setError("Please enter a valid approved quantity");
      return;
    }

    if (action === "REJECTED" && !rejectionReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const updateData = {
        status: action,
        notes: notes.trim(),
      };

      if (action === "APPROVED") {
        updateData.quantity_approved = parseInt(quantityApproved);
      } else if (action === "REJECTED") {
        updateData.rejection_reason = rejectionReason.trim();
      }

      await requestsAPI.update(request.id, updateData);
      onComplete();
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || "Failed to update request";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Transition show={open} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      Review Request
                    </Dialog.Title>

                    <div className="mt-4 bg-gray-50 rounded-md p-4">
                      <h4 className="font-medium text-gray-900">
                        {request.commodity_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Requested by: {request.requester_name}
                      </p>

                      <p className="text-sm text-gray-600">
                        Quantity: {request.quantity_requested}{" "}
                        {request.commodity_unit}
                      </p>
                      {request.reason_for_request && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-900">
                            Reason:
                          </p>
                          <p className="text-sm text-gray-600">
                            {request.reason_for_request}
                          </p>
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      {/* Action Selection */}
                      <div>
                        <label className="text-sm font-medium text-gray-900">
                          Decision *
                        </label>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center">
                            <input
                              id="approve"
                              name="action"
                              type="radio"
                              value="APPROVED"
                              checked={action === "APPROVED"}
                              onChange={(e) => setAction(e.target.value)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <label
                              htmlFor="approve"
                              className="ml-3 block text-sm font-medium text-gray-700"
                            >
                              Approve Request
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="reject"
                              name="action"
                              type="radio"
                              value="REJECTED"
                              checked={action === "REJECTED"}
                              onChange={(e) => setAction(e.target.value)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <label
                              htmlFor="reject"
                              className="ml-3 block text-sm font-medium text-gray-700"
                            >
                              Reject Request
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Approved Quantity */}
                      {action === "APPROVED" && (
                        <div>
                          <label htmlFor="quantity" className="label">
                            Approved Quantity *
                          </label>
                          <input
                            type="number"
                            id="quantity"
                            min="1"
                            max={request.quantity_requested}
                            value={quantityApproved}
                            onChange={(e) =>
                              setQuantityApproved(e.target.value)
                            }
                            className="input-field"
                            required
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Maximum: {request.quantity_requested}{" "}
                            {request.commodity_unit}
                          </p>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {action === "REJECTED" && (
                        <div>
                          <label htmlFor="rejection-reason" className="label">
                            Reason for Rejection *
                          </label>
                          <textarea
                            id="rejection-reason"
                            rows={3}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="input-field"
                            placeholder="Explain why this request is being rejected"
                            required
                          />
                        </div>
                      )}

                      {/* Additional Notes */}
                      <div>
                        <label htmlFor="notes" className="label">
                          Additional Notes (Optional)
                        </label>
                        <textarea
                          id="notes"
                          rows={2}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="input-field"
                          placeholder="Any additional comments for the requester"
                        />
                      </div>

                      {/* Submit Buttons */}
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={onClose}
                          className="btn-secondary"
                          disabled={submitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-primary disabled:opacity-50"
                          disabled={submitting || !action}
                        >
                          {submitting ? (
                            <div className="flex items-center">
                              <div className="spinner mr-2"></div>
                              Processing...
                            </div>
                          ) : (
                            `${
                              action === "APPROVED" ? "Approve" : "Reject"
                            } Request`
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ApprovalModal;
