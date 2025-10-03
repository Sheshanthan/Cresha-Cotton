import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DesignerView = ({ user, onLogout, onUpdateProfile }) => {
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    fetchAssignedOrders();
  }, []);

  const fetchAssignedOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/designer/${user._id || user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setAssignedOrders(data.orders);
      } else {
        setError(data.message || 'Failed to fetch assigned orders');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      setError(''); // Clear any previous errors
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'ready_for_delivery' })
      });

      const data = await response.json();

      if (data.success) {
        // Update the order status in local state
        setAssignedOrders(assignedOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'ready_for_delivery' }
            : order
        ));
        
        // Show success message
        setSuccess('Order marked as completed and ready for delivery!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to complete order');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      setError('Network error. Please try again.');
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


  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-blue-600">Designer Panel</h1>
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
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-blue-900/70 to-pink-900/60"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Designer Panel
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform creative visions into reality. Manage your assigned orders and bring 
              innovative designs to life with precision and artistry.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white px-8 py-3 rounded-2xl text-lg font-bold transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl shadow-xl"
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
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Assigned Orders</h2>
            <p className="text-gray-600 mt-1">Orders assigned to you for production</p>
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

          {/* Assigned Orders Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Assigned Orders
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Total assigned orders: {assignedOrders.length}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-lg text-gray-600">Loading assigned orders...</div>
              </div>
            ) : assignedOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">No assigned orders</div>
                <div className="text-gray-400">You haven't been assigned any orders yet.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignedOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td colSpan="6" className="px-6 py-4">
                          {/* Order Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="text-lg font-semibold text-gray-900">
                                Order #{order._id.slice(-8).toUpperCase()}
                              </div>
                              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                {getStatusDisplayName(order.status)}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              {order.status === 'in_production' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCompleteOrder(order._id);
                                  }}
                                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                                >
                                  Mark Complete
                                </button>
                              )}
                              {order.status === 'ready_for_delivery' && (
                                <span className="text-green-600 text-sm font-medium px-4 py-2">✅ Ready for delivery</span>
                              )}
                            </div>
                          </div>

                          {/* Order Details Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Customer Information */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="text-lg font-semibold text-blue-900 mb-3">Customer Information</h4>
                              <div className="space-y-2">
                                <div>
                                  <span className="text-sm font-medium text-blue-700">Name:</span>
                                  <span className="ml-2 text-sm text-blue-900">{order.name}</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-blue-700">Email:</span>
                                  <span className="ml-2 text-sm text-blue-900">{order.email}</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-blue-700">Contact:</span>
                                  <span className="ml-2 text-sm text-blue-900">{order.contactNumber}</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-blue-700">Order Date:</span>
                                  <span className="ml-2 text-sm text-blue-900">{formatDate(order.orderDate)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Order Specifications */}
                            <div className="bg-green-50 p-4 rounded-lg">
                              <h4 className="text-lg font-semibold text-green-900 mb-3">Order Specifications</h4>
                              <div className="space-y-2">
                                <div>
                                  <span className="text-sm font-medium text-green-700">Gender:</span>
                                  <span className="ml-2 text-sm text-green-900">{getGenderDisplayName(order.gender)}</span>
                                </div>
                                
                                {/* Unisex-specific fields */}
                                {order.gender === 'unisex' && (
                                  <>
                                    {order.fabricType && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Fabric:</span>
                                        <span className="ml-2 text-sm text-green-900 capitalize">{order.fabricType}</span>
                                      </div>
                                    )}
                                    {order.color && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Color:</span>
                                        <div className="ml-2 flex items-center space-x-2">
                                          <div 
                                            className="w-4 h-4 rounded-full border border-gray-300"
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
                                          <span className="text-sm text-green-900 capitalize">{order.color}</span>
                                        </div>
                                      </div>
                                    )}
                                    {order.fit && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Fit:</span>
                                        <span className="ml-2 text-sm text-green-900 capitalize">{order.fit}</span>
                                      </div>
                                    )}
                                    {order.sizingType && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Sizing:</span>
                                        <span className="ml-2 text-sm text-green-900 capitalize">{order.sizingType}</span>
                                      </div>
                                    )}
                                    {order.standardSize && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Size:</span>
                                        <span className="ml-2 text-sm text-green-900">{order.standardSize}</span>
                                      </div>
                                    )}
                                    {order.customMeasurements && order.customMeasurements.chest && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Measurements:</span>
                                        <div className="ml-2 text-sm text-green-900 bg-white p-2 rounded">
                                          <div>Chest: {order.customMeasurements.chest}"</div>
                                          <div>Waist: {order.customMeasurements.waist}"</div>
                                          <div>Length: {order.customMeasurements.length}"</div>
                                          <div>Shoulder: {order.customMeasurements.shoulder}"</div>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Male-specific fields */}
                                {order.gender === 'male' && (
                                  <>
                                    {order.collarStyle && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Collar:</span>
                                        <span className="ml-2 text-sm text-green-900 capitalize">{order.collarStyle}</span>
                                      </div>
                                    )}
                                    {order.cuffType && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Cuff:</span>
                                        <span className="ml-2 text-sm text-green-900 capitalize">{order.cuffType}</span>
                                      </div>
                                    )}
                                    {order.pocketStyle && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Pocket:</span>
                                        <span className="ml-2 text-sm text-green-900 capitalize">{order.pocketStyle}</span>
                                      </div>
                                    )}
                                    {order.trouserFit && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Trouser Fit:</span>
                                        <span className="ml-2 text-sm text-green-900 capitalize">{order.trouserFit}</span>
                                      </div>
                                    )}
                                    {order.jacketStyle && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Jacket:</span>
                                        <span className="ml-2 text-sm text-green-900 capitalize">{order.jacketStyle}</span>
                                      </div>
                                    )}
                                    {order.buttonCount && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Buttons:</span>
                                        <span className="ml-2 text-sm text-green-900">{order.buttonCount}</span>
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Female-specific fields */}
                                {order.gender === 'female' && (
                                  <>
                                    {order.sleeveStyle && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Sleeve:</span>
                                        <span className="ml-2 text-sm text-green-900 capitalize">{order.sleeveStyle}</span>
                                      </div>
                                    )}
                                    {order.neckline && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Neckline:</span>
                                        <span className="ml-2 text-sm text-green-900 capitalize">{order.neckline}</span>
                                      </div>
                                    )}
                                    {order.hemline && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Hemline:</span>
                                        <span className="ml-2 text-sm text-green-900 capitalize">{order.hemline}</span>
                                      </div>
                                    )}
                                    {order.dressLength && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Length:</span>
                                        <span className="ml-2 text-sm text-green-900 capitalize">{order.dressLength}</span>
                                      </div>
                                    )}
                                    {order.closure && (
                                      <div>
                                        <span className="text-sm font-medium text-green-700">Closure:</span>
                                        <span className="ml-2 text-sm text-green-900 capitalize">{order.closure}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Delivery Information */}
                            <div className="bg-yellow-50 p-4 rounded-lg">
                              <h4 className="text-lg font-semibold text-yellow-900 mb-3">Delivery Information</h4>
                              <div className="space-y-2">
                                <div>
                                  <span className="text-sm font-medium text-yellow-700">Address:</span>
                                  <div className="mt-1 text-sm text-yellow-900 bg-white p-2 rounded">
                                    {order.address || 'No address provided'}
                                  </div>
                                </div>
                                {order.description && (
                                  <div>
                                    <span className="text-sm font-medium text-yellow-700">Description:</span>
                                    <div className="mt-1 text-sm text-yellow-900 bg-white p-2 rounded">
                                      {order.description}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
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

export default DesignerView; 