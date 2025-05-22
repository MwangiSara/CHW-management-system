import React, { useState } from "react";
import { useAuth } from "../context/authContext";
import { authAPI } from "../services/api";

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    try {
      setLoading(true);
      await authAPI.changePassword(passwordForm);
      setMessage({ type: "success", text: "Password changed successfully" });
      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to change password";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordFormChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
    if (message.text) setMessage({ type: "", text: "" });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        {/* Profile Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-1 text-gray-600">
            Manage your account information and settings
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "password"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Change Password
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Username</label>
                  <input
                    type="text"
                    value={user?.username || ""}
                    className="input-field bg-gray-50"
                    disabled
                  />
                </div>

                <div>
                  <label className="label">Role</label>
                  <input
                    type="text"
                    value={user?.role || ""}
                    className="input-field bg-gray-50"
                    disabled
                  />
                </div>

                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    value={user?.first_name || ""}
                    className="input-field bg-gray-50"
                    disabled
                  />
                </div>

                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    value={user?.last_name || ""}
                    className="input-field bg-gray-50"
                    disabled
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    className="input-field bg-gray-50"
                    disabled
                  />
                </div>

                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="text"
                    value={user?.phone_number || ""}
                    className="input-field bg-gray-50"
                    disabled
                  />
                </div>

                <div>
                  <label className="label">Location</label>
                  <input
                    type="text"
                    value={user?.location || ""}
                    className="input-field bg-gray-50"
                    disabled
                  />
                </div>

                {user?.supervisor_name && (
                  <div>
                    <label className="label">Supervisor</label>
                    <input
                      type="text"
                      value={user.supervisor_name}
                      className="input-field bg-gray-50"
                      disabled
                    />
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-blue-700 text-sm">
                  <strong>Note:</strong> Profile information can only be updated
                  by system administrators. Contact your supervisor if you need
                  to make changes.
                </p>
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div className="max-w-md">
              {message.text && (
                <div
                  className={`mb-4 p-3 rounded-md ${
                    message.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="old_password" className="label">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    id="old_password"
                    name="old_password"
                    value={passwordForm.old_password}
                    onChange={handlePasswordFormChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="new_password" className="label">
                    New Password *
                  </label>
                  <input
                    type="password"
                    id="new_password"
                    name="new_password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordFormChange}
                    className="input-field"
                    minLength="8"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label htmlFor="confirm_password" className="label">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordFormChange}
                    className="input-field"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-2"></div>
                      Changing Password...
                    </div>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
