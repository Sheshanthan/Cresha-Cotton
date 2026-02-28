import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ReturnOrdersPage = ({ user, onLogout, onUpdateProfile }) => {
  const [returnOrders, setReturnOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    customerName: '',
    customerPhone: '',
    reasonForReturn: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const handleUpdateProfile = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Filter only delivered orders
        const deliveredOrders = data.orders.filter(order => order.status === 'delivered');
        setOrders(deliveredOrders);
      } else {
        console.error('Failed to fetch orders:', data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReturnOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/return-orders/my-returns', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setReturnOrders(data.returnOrders);
      } else {
        console.error('Failed to fetch return orders:', data.message);
      }
    } catch (error) {
      console.error('Error fetching return orders:', error);
    }
  };

  const handleDeleteReturnOrder = async (returnOrderId) => {
    if (!window.confirm('Are you sure you want to delete this return order?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/return-orders/${returnOrderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('Return order deleted successfully!');
        // Refresh the return orders list
        fetchReturnOrders();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to delete return order');
      }
    } catch (error) {
      console.error('Error deleting return order:', error);
      setMessage('Error deleting return order');
    }
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('No authentication token found. Please login again.');
        setSubmitting(false);
        return;
      }

      // Validate order selection
      if (!formData.orderId) {
        setMessage('Please select an order from the dropdown');
        setSubmitting(false);
        return;
      }

      const requestBody = {
        orderNumber: formData.orderId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        reasonForReturn: formData.reasonForReturn
      };
      
      console.log('Submitting form data:', formData);
      console.log('Request body being sent:', requestBody);
      
      const response = await fetch('http://localhost:5000/api/return-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not ok:', response.status, errorText);
        setMessage(`Server error: ${response.status} - ${errorText}`);
        setSubmitting(false);
        return;
      }
      
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setMessage('Return order created successfully!');
        setFormData({
          orderId: '',
          customerName: '',
          customerPhone: '',
          reasonForReturn: ''
        });
        // Refresh the return orders list
        fetchReturnOrders();
      } else {
        setMessage(data.message || 'Failed to create return order');
      }
    } catch (error) {
      console.error('Error creating return order:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setMessage('Network error: Cannot connect to backend server. Please check if the server is running.');
      } else {
        setMessage(`Error creating return order: ${error.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-green-600">Return Orders</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
                Welcome, {user?.name || user?.email}
              </span>
              <button
                onClick={() => navigate('/profile')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Profile
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Return Orders</h2>
            <p className="text-gray-600 mt-1">Create and manage your return orders</p>
          </div>

          {/* Return Order Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Return Order</h3>
            
            {message && (
              <div className={`mb-4 p-3 rounded-md ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Order *
                  </label>
                  <select
                    id="orderId"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Choose an order</option>
                    {orders.map((order) => (
                      <option key={order._id} value={order._id}>
                        {order.name} - {order.description} (LKR {order.price})
                      </option>
                    ))}
                  </select>
                  {orders.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No delivered orders available for return
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Phone *
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="reasonForReturn" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Return *
                  </label>
                  <textarea
                    id="reasonForReturn"
                    name="reasonForReturn"
                    value={formData.reasonForReturn}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Please describe the reason for return..."
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || orders.length === 0}
                  className={`px-6 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
                    submitting || orders.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {submitting ? 'Creating...' : 'Create Return Order'}
                </button>
              </div>
            </form>
          </div>

          {/* Return Orders List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Return Orders</h3>
            
            {returnOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">No return orders yet</div>
                <div className="text-gray-400">Create a return order using the form above</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {returnOrders.map((returnOrder) => (
                          <tr key={returnOrder._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {returnOrder.orderId?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {returnOrder.orderId?.description}
                              </div>
                              <div className="text-sm text-gray-500">
                                ${returnOrder.orderId?.price}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {returnOrder.customerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {returnOrder.customerPhone}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {returnOrder.reasonForReturn}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(returnOrder.status)}`}>
                                {returnOrder.status.charAt(0).toUpperCase() + returnOrder.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(returnOrder.returnDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    console.log('Update button clicked for return order:', returnOrder._id);
                                    console.log('Full return order object:', returnOrder);
                                    navigate(`/return-orders/edit/${returnOrder._id}`);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200"
                                >
                                  Update
                                </button>
                                <button
                                  onClick={() => handleDeleteReturnOrder(returnOrder._id)}
                                  className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReturnOrdersPage;
