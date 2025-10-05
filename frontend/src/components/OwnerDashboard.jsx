import React, { useState, useEffect } from 'react';
import ProductForm from './ProductForm';
import { useNavigate } from 'react-router-dom';

const OwnerDashboard = ({ user, onLogout, onUpdateProfile }) => {
  const [orders, setOrders] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);

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
    fetchOrders();
    fetchDesigners();
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

  const fetchDesigners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/role/1', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setDesigners(data.users);
      } else {
        console.error('Failed to fetch designers:', data.message);
      }
    } catch (error) {
      console.error('Error fetching designers:', error);
    }
  };



  const createProduct = async (productData) => {
    setCreatingProduct(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Don't set Content-Type header for FormData, let the browser set it with boundary
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: productData
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Product created successfully!');
        setShowProductForm(false);
        fetchProducts(); // Refresh products list
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to create product');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setCreatingProduct(false);
    }
  };



  const handleConfirmOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'confirmed' })
      });

      const data = await response.json();

      if (data.success) {
        // Update the order status in local state
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'confirmed' }
            : order
        ));
      } else {
        setError(data.message || 'Failed to confirm order');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      const data = await response.json();

      if (data.success) {
        // Update the order status in local state
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'cancelled' }
            : order
        ));
      } else {
        setError(data.message || 'Failed to cancel order');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleAssignDesigner = async (orderId, designerId) => {
    // Don't proceed if no designer is selected
    if (!designerId) {
      return;
    }

    try {
      setError(''); // Clear any previous errors
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          designerId: designerId,
          status: 'in_production'
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update the order in local state
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, designerId: designerId, status: 'in_production' }
            : order
        ));
        
        // Show success message
        const designerName = designers.find(d => d._id === designerId)?.name || 'Designer';
        setSuccess(`Order successfully assigned to ${designerName}`);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to assign designer');
      }
    } catch (error) {
      console.error('Error assigning designer:', error);
      setError('Network error. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': 'bg-blue-100 text-blue-800',
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

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-orange-600">Owner Dashboard</h1>
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
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/80 via-yellow-900/70 to-red-900/60"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
                Owner Dashboard
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Complete business oversight and order management. Monitor operations, 
              manage products, and drive business growth with comprehensive tools.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group bg-gradient-to-r from-orange-400 to-yellow-500 hover:from-orange-500 hover:to-yellow-600 text-white px-8 py-3 rounded-2xl text-lg font-bold transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl shadow-xl"
              >
                <span className="flex items-center space-x-2">
                  <span>View Dashboard</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <button
                onClick={() => setShowProductForm(true)}
                className="group bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 px-8 py-3 rounded-2xl text-lg font-bold transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
              >
                <span className="flex items-center space-x-2">
                  <span>Add Product</span>
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
              <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
              <p className="text-gray-600 mt-1">Manage all customer orders from this dashboard</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Add New Product
              </button>
              <button
                onClick={() => navigate('/products')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                View All Products
              </button>
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
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr 
                        key={order._id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(order)}
                      >
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
                          {getGenderDisplayName(order.gender)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusDisplayName(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={order.designerId || ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignDesigner(order._id, e.target.value);
                              }
                            }}
                            disabled={order.status !== 'confirmed'}
                            className={`px-2 py-1 text-xs border rounded-md transition-colors duration-200 ${
                              order.status === 'confirmed' 
                                ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                                : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <option value="">Select Designer</option>
                            {designers.map((designer) => (
                              <option key={designer._id} value={designer._id}>
                                {designer.name}
                              </option>
                            ))}
                          </select>
                          {order.designerId && (
                            <div className="mt-1 text-xs text-gray-600">
                              Assigned to: {designers.find(d => d._id === order.designerId)?.name || 'Unknown'}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleConfirmOrder(order._id)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors duration-200"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleCancelOrder(order._id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors duration-200"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {order.status === 'confirmed' && (
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors duration-200"
                              >
                                Cancel
                              </button>
                            )}
                            {order.status === 'cancelled' && (
                              <span className="text-gray-500 text-xs">No actions available</span>
                            )}
                            {order.status === 'delivered' && (
                              <span className="text-gray-500 text-xs">Order completed</span>
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



      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          onSubmit={createProduct}
          onCancel={() => setShowProductForm(false)}
          loading={creatingProduct}
        />
      )}




      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                Order Details - #{selectedOrder._id.slice(-8).toUpperCase()}
              </h3>
              <button
                onClick={handleCloseOrderDetails}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Order Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Order Date:</span>
                      <span className="ml-2 text-sm text-gray-800">{formatDate(selectedOrder.orderDate)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusDisplayName(selectedOrder.status)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Gender:</span>
                      <span className="ml-2 text-sm text-gray-800">{getGenderDisplayName(selectedOrder.gender)}</span>
                    </div>
                    
                    {/* Unisex-specific fields */}
                    {selectedOrder.gender === 'unisex' && (
                      <>
                        {selectedOrder.fabricType && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Fabric Type:</span>
                            <span className="ml-2 text-sm text-gray-800 capitalize">{selectedOrder.fabricType}</span>
                          </div>
                        )}
                        {selectedOrder.color && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Color:</span>
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
                                  }[selectedOrder.color] || '#CCCCCC'
                                }}
                              />
                              <span className="text-sm text-gray-800 capitalize">{selectedOrder.color}</span>
                            </div>
                          </div>
                        )}
                        {selectedOrder.fit && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Fit:</span>
                            <span className="ml-2 text-sm text-gray-800 capitalize">{selectedOrder.fit}</span>
                          </div>
                        )}
                        {selectedOrder.sizingType && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Sizing:</span>
                            <span className="ml-2 text-sm text-gray-800 capitalize">{selectedOrder.sizingType}</span>
                          </div>
                        )}
                        {selectedOrder.standardSize && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Standard Size:</span>
                            <span className="ml-2 text-sm text-gray-800">{selectedOrder.standardSize}</span>
                          </div>
                        )}
                        {selectedOrder.customMeasurements && selectedOrder.customMeasurements.chest && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Custom Measurements:</span>
                            <div className="ml-2 text-sm text-gray-800 bg-gray-50 p-2 rounded">
                              <div>Chest: {selectedOrder.customMeasurements.chest}"</div>
                              <div>Waist: {selectedOrder.customMeasurements.waist}"</div>
                              <div>Length: {selectedOrder.customMeasurements.length}"</div>
                              <div>Shoulder: {selectedOrder.customMeasurements.shoulder}"</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Male-specific fields */}
                    {selectedOrder.gender === 'male' && (
                      <>
                        {selectedOrder.collarStyle && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Collar Style:</span>
                            <span className="ml-2 text-sm text-gray-800 capitalize">{selectedOrder.collarStyle}</span>
                          </div>
                        )}
                        {selectedOrder.cuffType && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Cuff Type:</span>
                            <span className="ml-2 text-sm text-gray-800 capitalize">{selectedOrder.cuffType}</span>
                          </div>
                        )}
                        {selectedOrder.pocketStyle && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Pocket Style:</span>
                            <span className="ml-2 text-sm text-gray-800 capitalize">{selectedOrder.pocketStyle}</span>
                          </div>
                        )}
                        {selectedOrder.trouserFit && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Trouser Fit:</span>
                            <span className="ml-2 text-sm text-gray-800 capitalize">{selectedOrder.trouserFit}</span>
                          </div>
                        )}
                        {selectedOrder.jacketStyle && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Jacket Style:</span>
                            <span className="ml-2 text-sm text-gray-800 capitalize">{selectedOrder.jacketStyle}</span>
                          </div>
                        )}
                        {selectedOrder.buttonCount && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Button Count:</span>
                            <span className="ml-2 text-sm text-gray-800">{selectedOrder.buttonCount}</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Female-specific fields */}
                    {selectedOrder.gender === 'female' && (
                      <>
                        {selectedOrder.sleeveStyle && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Sleeve Style:</span>
                            <span className="ml-2 text-sm text-gray-800 capitalize">{selectedOrder.sleeveStyle}</span>
                          </div>
                        )}
                        {selectedOrder.neckline && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Neckline:</span>
                            <span className="ml-2 text-sm text-gray-800 capitalize">{selectedOrder.neckline}</span>
                          </div>
                        )}
                        {selectedOrder.hemline && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Hemline:</span>
                            <span className="ml-2 text-sm text-gray-800 capitalize">{selectedOrder.hemline}</span>
                          </div>
                        )}
                        {selectedOrder.dressLength && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Dress/Skirt Length:</span>
                            <span className="ml-2 text-sm text-gray-800 capitalize">{selectedOrder.dressLength}</span>
                          </div>
                        )}
                        {selectedOrder.closure && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Closure:</span>
                            <span className="ml-2 text-sm text-gray-800 capitalize">{selectedOrder.closure}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <span className="ml-2 text-sm text-gray-800">{selectedOrder.name}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Email:</span>
                      <span className="ml-2 text-sm text-gray-800">{selectedOrder.email}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Contact:</span>
                      <span className="ml-2 text-sm text-gray-800">{selectedOrder.contactNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Delivery Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Address:</span>
                    <div className="mt-1 text-sm text-gray-800 bg-gray-50 p-3 rounded-md">
                      {selectedOrder.address || 'No address provided'}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Coordinates:</span>
                    <span className="ml-2 text-sm text-gray-800">{selectedOrder.deliveryLocation}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedOrder.description && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Description</h4>
                  <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md">
                    {selectedOrder.description}
                  </div>
                </div>
              )}

              {/* Designer Assignment */}
              {selectedOrder.designerId && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Designer Assignment</h4>
                  <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md">
                    Assigned to: {designers.find(d => d._id === selectedOrder.designerId)?.name || 'Unknown Designer'}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleCloseOrderDetails}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard; 