import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditReturnOrderPage = ({ user, onLogout, onUpdateProfile }) => {
  const [returnOrder, setReturnOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    customerName: '',
    customerPhone: '',
    reasonForReturn: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

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
    console.log('EditReturnOrderPage useEffect triggered with ID:', id);
    fetchReturnOrder();
    fetchDeliveredOrders();
  }, [id]);

  const fetchReturnOrder = async () => {
    try {
      console.log('Fetching return order with ID:', id);
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      const response = await fetch(`http://localhost:5000/api/return-orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        console.log('Return order fetched successfully:', data.returnOrder);
        setReturnOrder(data.returnOrder);
        setFormData({
          orderId: data.returnOrder.orderId._id || data.returnOrder.orderId,
          customerName: data.returnOrder.customerName,
          customerPhone: data.returnOrder.customerPhone,
          reasonForReturn: data.returnOrder.reasonForReturn
        });
      } else {
        console.error('Failed to fetch return order:', data.message);
        setMessage(data.message || 'Failed to fetch return order');
      }
    } catch (error) {
      console.error('Error fetching return order:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setMessage('Error fetching return order');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveredOrders = async () => {
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
      
      console.log('Updating return order with data:', requestBody);
      
      const response = await fetch(`http://localhost:5000/api/return-orders/${id}`, {
        method: 'PUT',
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
        setMessage('Return order updated successfully!');
        // Redirect back to return orders page after a short delay
        setTimeout(() => {
          navigate('/return-orders');
        }, 1500);
      } else {
        setMessage(data.message || 'Failed to update return order');
      }
    } catch (error) {
      console.error('Error updating return order:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setMessage('Network error: Cannot connect to backend server. Please check if the server is running.');
      } else {
        setMessage(`Error updating return order: ${error.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading return order...</p>
        </div>
      </div>
    );
  }

  if (!returnOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Return order not found</p>
          <button
            onClick={() => navigate('/return-orders')}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Back to Return Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-green-600">Edit Return Order</h1>
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
                onClick={() => navigate('/return-orders')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Back to Return Orders
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
            <h2 className="text-2xl font-bold text-gray-900">Edit Return Order</h2>
            <p className="text-gray-600 mt-1">Update the details of your return order</p>
          </div>

          {/* Edit Return Order Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Return Order</h3>
            
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
                      No delivered orders available
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

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/return-orders')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || orders.length === 0}
                  className={`px-6 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
                    submitting || orders.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {submitting ? 'Updating...' : 'Update Return Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditReturnOrderPage;
