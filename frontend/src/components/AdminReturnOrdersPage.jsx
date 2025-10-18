import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { User, ArrowLeft, LogOut, ShoppingBag, FileText } from "lucide-react";

const AdminReturnOrdersPage = ({ user, onLogout, onUpdateProfile }) => {
  const [returnOrders, setReturnOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchReturnOrders();
  }, []);

  const fetchReturnOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/return-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setReturnOrders(data.returnOrders);
      else setError(data.message || "Failed to fetch return orders");
    } catch (err) {
      console.error(err);
      setError("Error fetching return orders");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-purple-100 text-purple-800";
    }
  };

  const getRoleName = (role) => {
    const roles = { 1: "Designer", 2: "Buyer", 3: "Delivery Personal" };
    return roles[role] || "Unknown";
  };

  const filteredReturnOrders = returnOrders.filter((ro) => {
    const matchesSearch =
      ro.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ro.customerPhone?.includes(searchTerm) ||
      ro.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ro.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ro.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const generatePDF = () => {
    if (!filteredReturnOrders.length) {
      alert("No return orders to export.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Return Orders Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [["Customer", "Phone", "Order", "Reason", "Status", "Date"]],
      body: filteredReturnOrders.map((ro) => [
        ro.customerName || "N/A",
        ro.customerPhone || "N/A",
        ro.orderId?.name || "N/A",
        ro.reasonForReturn || "N/A",
        ro.status || "N/A",
        new Date(ro.returnDate).toLocaleDateString(),
      ]),
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [255, 204, 0] },
    });

    doc.save(`ReturnOrders_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading return orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "url('https://www.shutterstock.com/image-photo/background-image-elegant-clothing-boutique-600nw-2336662841.jpg')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/50 z-0"></div>

      {/* Page Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-purple-200 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-semibold text-purple-600 flex items-center">
                <ShoppingBag className="w-6 h-6 mr-2 text-pink-500" /> Admin Return Orders
              </h1>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 bg-purple-100 px-3 py-1 rounded-md">
                  Welcome, {user?.name || user?.email}
                </span>
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  <User className="w-4 h-4 mr-2" /> Profile
                </button>
                <button
                  onClick={() => navigate("/admin-dashboard")}
                  className="flex items-center bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Filters and PDF */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border border-purple-100 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by customer or user"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={generatePDF}
              className="flex items-center bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
            >
              <FileText className="w-4 h-4 mr-2" /> Download PDF
            </button>

            <div className="text-sm text-gray-500">
              Total: {returnOrders.length} | Showing: {filteredReturnOrders.length}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-x-auto border border-purple-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-purple-50">
                <tr>
                  {["Customer", "Order", "User", "Reason", "Status", "Date", "Actions"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-6 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReturnOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No return orders found
                    </td>
                  </tr>
                ) : (
                  filteredReturnOrders.map((ro) => (
                    <tr key={ro._id} className="hover:bg-purple-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{ro.customerName}</div>
                        <div className="text-sm text-gray-500">{ro.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{ro.orderId?.name || "N/A"}</div>
                        <div className="text-sm text-gray-500">{ro.orderId?.description || "N/A"}</div>
                        <div className="text-sm text-gray-500">${ro.orderId?.price || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{ro.userId?.name || "N/A"}</div>
                        <div className="text-sm text-gray-500">{ro.userId?.email || "N/A"}</div>
                        <div className="text-sm text-gray-500">{getRoleName(ro.userId?.role || 0)}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">{ro.reasonForReturn}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            ro.status
                          )}`}
                        >
                          {ro.status.charAt(0).toUpperCase() + ro.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(ro.returnDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 flex flex-col space-y-2">
                        <select
                          value={ro.status}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            // handle status update
                          }}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminReturnOrdersPage;
