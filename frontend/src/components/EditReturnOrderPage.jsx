import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LogOut, User, ArrowLeft, RefreshCcw, Shirt } from "lucide-react";

const EditReturnOrderPage = ({ user, onLogout, onUpdateProfile }) => {
  const [returnOrder, setReturnOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    orderId: "",
    customerName: "",
    customerPhone: "",
    reasonForReturn: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
  };

  useEffect(() => {
    fetchReturnOrder();
    fetchDeliveredOrders();
  }, [id]);

  const fetchReturnOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/return-orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setReturnOrder(data.returnOrder);
        setFormData({
          orderId: data.returnOrder.orderId._id || data.returnOrder.orderId,
          customerName: data.returnOrder.customerName,
          customerPhone: data.returnOrder.customerPhone,
          reasonForReturn: data.returnOrder.reasonForReturn,
        });
      } else {
        setMessage(data.message || "Failed to fetch return order");
      }
    } catch (error) {
      setMessage("Error fetching return order");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveredOrders = async () => {
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
      const response = await fetch(`http://localhost:5000/api/return-orders/${id}`, {
        method: "PUT",
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
        setMessage("Return order updated successfully!");
        setTimeout(() => navigate("/return-orders"), 1500);
      } else {
        setMessage(data.message || "Failed to update return order");
      }
    } catch (error) {
      setMessage("Error updating return order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading return order...</p>
        </div>
      </div>
    );
  }

  if (!returnOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Return order not found</p>
          <button
            onClick={() => navigate("/return-orders")}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md"
          >
            Back to Return Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed flex flex-col"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/free-photo/fast-fashion-concept-with-full-clothing-store_23-2150871345.jpg')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>

      <div className="relative flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-purple-200 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Shirt className="text-purple-500 w-7 h-7" />
                <h1 className="text-xl font-semibold text-purple-600">Edit Return Order</h1>
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
                  onClick={() => navigate("/return-orders")}
                  className="flex items-center bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Return Orders
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

        {/* Main Content */}
        <main className="flex-grow max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-purple-100">
            <h3 className="text-xl font-semibold text-purple-700 mb-5 flex items-center">
              <RefreshCcw className="w-5 h-5 mr-2 text-pink-500" /> Update Return Order
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

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate("/return-orders")}
                  className="px-6 py-2 rounded-md text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2 rounded-md text-white font-medium shadow-md transition-all duration-200 ${
                    submitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-500 hover:bg-purple-600"
                  }`}
                >
                  {submitting ? "Updating..." : "Update Return Order"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditReturnOrderPage;
