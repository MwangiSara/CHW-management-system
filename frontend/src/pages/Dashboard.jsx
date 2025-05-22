import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { requestsAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import StatsCards from "../components/dashboard/StatsCards";
import RequestsChart from "../components/dashboard/RequestsChart";
import RecentRequests from "../components/dashboard/RecentRequests";
import AllocationStatus from "../components/dashboard/AllocationStatus";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, allocationResponse] = await Promise.all([
        requestsAPI.getDashboardStats(),
        user?.role === "CHW"
          ? requestsAPI.getAllocationStatus()
          : Promise.resolve({ data: null }),
      ]);

      setStats(statsResponse.data);
      setAllocation(allocationResponse.data);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <div className="text-red-600 text-center p-4">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="mt-1 text-gray-600">
          {user?.role === "CHW" &&
            "Manage your commodity requests and track allocations"}
          {user?.role === "CHA" &&
            "Review and approve commodity requests from your CHWs"}
          {user?.role === "ADMIN" &&
            "Monitor system-wide commodity request activities"}
        </p>
      </div>

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} userRole={user?.role} />}

      {/* CHW-specific Allocation Status */}
      {/* {user?.role === "CHW" && allocation && (
        <AllocationStatus allocation={allocation} />
      )} */}

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1  gap-6">
        {/* {stats && <RequestsChart stats={stats} />} */}
        {stats?.recent_requests && (
          <RecentRequests requests={stats.recent_requests} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
