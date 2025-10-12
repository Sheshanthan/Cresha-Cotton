import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminOrdersPage = ({ user, onLogout, onUpdateProfile }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    fetchOrders();
  }, []);


  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'in_production': 'bg-purple-100 text-purple-800',
      'ready_for_delivery': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusDisplayName = (status) => {
    const statusNames = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'in_production': 'In Production',
      'ready_for_delivery': 'Ready for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusNames[status] || status;
  };

  const getGenderDisplayName = (gender) => {
    const genderNames = {
      'male': 'Male',
      'female': 'Female',
      'unisex': 'Unisex'
    };
    return genderNames[gender] || gender;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate order amount based on gender
  const calculateOrderAmount = (order) => {
    let baseAmount = 0;
    
    // Base amount by gender in LKR
    if (order.gender === 'male') {
      baseAmount = 2000; // 2000 LKR for male clothing
    } else if (order.gender === 'female') {
      baseAmount = 2500; // 2500 LKR for female clothing
    } else {
      baseAmount = 2500; // 2500 LKR for unisex clothing
    }

    return baseAmount;
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-red-600">Admin Orders Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
                Welcome, {user?.email}
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
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
              <p className="text-gray-600 mt-1">View and manage all customer orders from this page</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh Orders'}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600 text-lg font-bold"
              >
                ×
              </button>
            </div>
          )}


          {/* Orders Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                All Orders
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Total orders: {orders.length}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-lg text-gray-600">Loading orders...</div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">
                  No orders found
                </div>
                <div className="text-gray-400">
                  No customer orders have been placed yet.
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Order Amount (LKR)
                       </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.name}</div>
                          <div className="text-sm text-gray-500">{order.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.contactNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            {order.address || 'No address provided'}
                          </div>
                        </td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                           {calculateOrderAmount(order).toLocaleString()} LKR
                         </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getGenderDisplayName(order.gender)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusDisplayName(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.orderDate)}
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

export default AdminOrdersPage;
