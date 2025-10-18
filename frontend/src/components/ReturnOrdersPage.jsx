import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, LogOut, User, ArrowLeft, RefreshCcw, Shirt } from "lucide-react";

const ReturnOrdersPage = ({ user, onLogout, onUpdateProfile }) => {
  const [returnOrders, setReturnOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    orderId: "",
    customerName: "",
    customerPhone: "",
    reasonForReturn: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
  };

  const handleUpdateProfile = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    if (onUpdateProfile) {
      onUpdateProfile(updatedUser);
    }
  };

  useEffect(() => {
    fetchDeliveredOrders();
    fetchReturnOrders();
  }, []);

  const fetchDeliveredOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        const deliveredOrders = data.orders.filter((order) => order.status === "delivered");
        setOrders(deliveredOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReturnOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/return-orders/my-returns", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setReturnOrders(data.returnOrders);
    } catch (error) {
      console.error("Error fetching return orders:", error);
    }
  };

  const handleDeleteReturnOrder = async (returnOrderId) => {
    if (!window.confirm("Are you sure you want to delete this return order?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/return-orders/${returnOrderId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        setMessage("Return order deleted successfully!");
        fetchReturnOrders();
      }
    } catch (error) {
      console.error("Error deleting return order:", error);
      setMessage("Error deleting return order");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      if (!formData.orderId) {
        setMessage("Please select an order from the dropdown");
        setSubmitting(false);
        return;
      }
      const response = await fetch("http://localhost:5000/api/return-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderNumber: formData.orderId,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          reasonForReturn: formData.reasonForReturn,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Return order created successfully!");
        setFormData({
          orderId: "",
          customerName: "",
          customerPhone: "",
          reasonForReturn: "",
        });
        fetchReturnOrders();
      } else {
        setMessage(data.message || "Failed to create return order");
      }
    } catch (error) {
      setMessage("Error creating return order");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-purple-100 text-purple-800";
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed flex flex-col"
      style={{
        backgroundImage:
          "url('https://www.shutterstock.com/image-illustration/clothes-on-sand-dune-background-600nw-2490651895.jpg')",
      }}
    >
      


      <div className="relative flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-purple-200 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Shirt className="text-purple-500 w-7 h-7" />
                <h1 className="text-xl font-semibold text-purple-600">Return Orders</h1>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 bg-purple-100 px-3 py-1 rounded-md">
                  Welcome, {user?.name || user?.email}
                </span>
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all duration-200"
                >
                  <User className="w-4 h-4 mr-2" /> Profile
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="flex-grow max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Form */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-10 border border-purple-100">
            <h3 className="text-xl font-semibold text-purple-700 mb-5 flex items-center">
              <RefreshCcw className="w-5 h-5 mr-2 text-pink-500" /> Create Return Order
            </h3>

            {message && (
              <div
                className={`mb-4 p-3 rounded-md text-sm font-medium ${
                  message.includes("successfully")
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Select Order *
                  </label>
                  <select
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  >
                    <option value="">Choose an order</option>
                    {orders.map((order) => (
                      <option key={order._id} value={order._id}>
                        {order.name} - {order.description} (LKR {order.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Customer Phone *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Reason for Return *
                  </label>
                  <textarea
                    name="reasonForReturn"
                    value={formData.reasonForReturn}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    placeholder="Describe your reason..."
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2 rounded-md text-white font-medium shadow-md transition-all duration-200 ${
                    submitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-500 hover:bg-purple-600"
                  }`}
                >
                  {submitting ? "Creating..." : "Create Return Order"}
                </button>
              </div>
            </form>
          </div>

          {/* Table */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-purple-100">
            <h3 className="text-xl font-semibold text-purple-700 mb-5 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-pink-500" /> My Return Orders
            </h3>

            {returnOrders.length === 0 ? (
              <div className="text-center py-12">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076476.png"
                  alt="No Orders"
                  className="mx-auto w-24 h-24 opacity-70 mb-3"
                />
                <p className="text-gray-500 text-lg">
                  No return orders yet. Create one above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-50">
                    <tr>
                      {["Order", "Customer", "Reason", "Status", "Date", "Actions"].map((col) => (
                        <th
                          key={col}
                          className="px-6 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {returnOrders.map((returnOrder) => (
                      <tr key={returnOrder._id} className="hover:bg-purple-50">
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {returnOrder.orderId?.name}
                          <div className="text-gray-500 text-xs">
                            {returnOrder.orderId?.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {returnOrder.customerName}
                          <div className="text-gray-500 text-xs">
                            {returnOrder.customerPhone}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">
                          {returnOrder.reasonForReturn}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              returnOrder.status
                            )}`}
                          >
                            {returnOrder.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(returnOrder.returnDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 flex space-x-2">
                          <button
                            onClick={() =>
                              navigate(`/return-orders/edit/${returnOrder._id}`)
                            }
                            className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-md text-xs font-medium"
                          >
                            Update
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteReturnOrder(returnOrder._id)
                            }
                            className="bg-pink-100 hover:bg-pink-200 text-pink-700 px-3 py-1 rounded-md text-xs font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReturnOrdersPage;
