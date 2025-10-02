import React, { useState, useEffect } from 'react';
import OrderDetailsModal from './OrderDetailsModal';
import { useNavigate } from 'react-router-dom';

const DeliveryPersonalView = ({ user, onLogout, onUpdateProfile }) => {
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const handleUpdateProfile = (updatedUser) => {
    // Update user data in localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    // Update parent component's user state
    if (onUpdateProfile) {
      onUpdateProfile(updatedUser);
    }
  };

  useEffect(() => {
    fetchDeliveryOrders();
  }, []);

  const fetchDeliveryOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      console.log('Fetching delivery orders with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('http://localhost:5000/api/orders/delivery', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setDeliveryOrders(data.orders);
        console.log('Delivery orders set:', data.orders);
      } else {
        console.error('API error:', data.message);
        setError(data.message || 'Failed to fetch delivery orders');
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverOrder = async (orderId) => {
    try {
      setError(''); // Clear any previous errors
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'delivered' })
      });

      const data = await response.json();

      if (data.success) {
        // Update the order status in local state
        setDeliveryOrders(deliveryOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'delivered' }
            : order
        ));
        
        // Show success message
        setSuccess('Order marked as delivered successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
        
        // Close the modal
        setShowOrderDetails(false);
        setSelectedOrder(null);
      } else {
        setError(data.message || 'Failed to mark order as delivered');
      }
    } catch (error) {
      console.error('Error delivering order:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };



  const handleCloseDetailsModal = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
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



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-purple-600">Delivery Personal Panel</h1>
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
                onClick={() => navigate('/')}
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

      {/* Hero Section with Banner Image */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/herobanner.png" 
            alt="Hero Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 via-blue-900/70 to-cyan-900/60"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-500 bg-clip-text text-transparent">
                Delivery Panel
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Efficiently manage and deliver orders to customers. Track delivery status 
              and ensure timely completion of all deliveries.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group bg-gradient-to-r from-indigo-400 to-cyan-500 hover:from-indigo-500 hover:to-cyan-600 text-white px-8 py-3 rounded-2xl text-lg font-bold transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl shadow-xl"
              >
                <span className="flex items-center space-x-2">
                  <span>View Orders</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="group bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 px-8 py-3 rounded-2xl text-lg font-bold transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
              >
                <span className="flex items-center space-x-2">
                  <span>Update Profile</span>
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Delivery Management</h2>
              <p className="text-gray-600 mt-1">Orders ready for delivery</p>
            </div>
            <button
              onClick={fetchDeliveryOrders}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh Orders'}
            </button>
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

          {/* Success Display */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm flex justify-between items-center">
              <span>{success}</span>
              <button
                onClick={() => setSuccess('')}
                className="text-green-400 hover:text-green-600 text-lg font-bold"
              >
                ×
              </button>
            </div>
          )}

          {/* Delivery Orders Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Orders Ready for Delivery
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Total delivery orders: {deliveryOrders.length}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-lg text-gray-600">Loading delivery orders...</div>
              </div>
            ) : deliveryOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">No delivery orders</div>
                <div className="text-gray-400">No orders are ready for delivery yet.</div>
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
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deliveryOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.name}</div>
                          <div className="text-sm text-gray-500">{order.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="space-y-1">
                            {order.fabricType && (
                              <div><span className="font-medium">Fabric:</span> {order.fabricType}</div>
                            )}
                            {order.color && (
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">Color:</span>
                                <div 
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{ 
                                    backgroundColor: {
                                      'black': '#000000',
                                      'white': '#FFFFFF',
                                      'blue': '#3B82F6',
                                      'red': '#EF4444',
                                      'green': '#10B981',
                                      'yellow': '#F59E0B',
                                      'purple': '#8B5CF6',
                                      'orange': '#F97316',
                                      'pink': '#EC4899',
                                      'brown': '#A16207',
                                      'gray': '#6B7280',
                                      'navy': '#1E3A8A',
                                      'maroon': '#991B1B',
                                      'olive': '#65A30D',
                                      'teal': '#0D9488',
                                      'lime': '#84CC16'
                                    }[order.color] || '#CCCCCC'
                                  }}
                                />
                                <span className="capitalize">{order.color}</span>
                              </div>
                            )}
                            {order.fit && (
                              <div><span className="font-medium">Fit:</span> {order.fit}</div>
                            )}
                            {order.sizingType && (
                              <div>
                                <span className="font-medium">Sizing:</span> {order.sizingType}
                                {order.standardSize && ` - ${order.standardSize}`}
                                {order.customMeasurements?.chest && (
                                  <span className="text-xs text-gray-500 block">
                                    Chest: {order.customMeasurements.chest}", Waist: {order.customMeasurements.waist}", 
                                    Length: {order.customMeasurements.length}", Shoulder: {order.customMeasurements.shoulder}"
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusDisplayName(order.status)}
                            </span>
                            {order.deliveryAccepted && (
                              <div className="text-xs text-green-600 font-medium">
                                ✓ Delivery Accepted
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {order.status !== 'delivered' && (
                              <button
                                onClick={() => handleShowDetails(order)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors duration-200"
                              >
                                Details
                              </button>
                              )}
                            {order.status === 'ready_for_delivery' && (
                              <button
                                onClick={() => handleDeliverOrder(order._id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors duration-200"
                              >
                                Mark Delivered
                              </button>
                            )}
                            {order.status === 'delivered' && (
                              <span className="text-gray-500 text-xs">Order delivered</span>
                            )}
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

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showOrderDetails}
        onClose={handleCloseDetailsModal}
        onDeliver={handleDeliverOrder}
      />
    </div>
  );
};

export default DeliveryPersonalView; 