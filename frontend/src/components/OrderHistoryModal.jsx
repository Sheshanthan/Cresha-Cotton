import React, { useState, useEffect } from 'react';
import OrderUpdateModal from './OrderUpdateModal';

const OrderHistoryModal = ({ isOpen, onClose, user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showOrderUpdate, setShowOrderUpdate] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchOrders();
    }
  }, [isOpen, user]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      console.log('Fetching orders with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setOrders(data.orders);
        console.log('Orders set:', data.orders);
      } else {
        console.error('API error:', data.message);
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleUpdateOrder = (order) => {
    setUpdatingOrder(order);
    setShowOrderUpdate(true);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Order deleted successfully!');
        // Remove the deleted order from the list
        setOrders(orders.filter(order => order._id !== orderId));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to delete order');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleOrderUpdated = (updatedOrder) => {
    // Update the order in the list
    setOrders(orders.map(order => 
      order._id === updatedOrder._id ? updatedOrder : order
    ));
    setSuccess('Order updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">My Orders</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-lg text-gray-600">Loading orders...</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg mb-2">No orders found</div>
              <div className="text-gray-400">You haven't placed any orders yet.</div>
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
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
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
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order._id.slice(-8).toUpperCase()}
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            View Details
                          </button>
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateOrder(order)}
                                className="text-green-600 hover:text-green-900 font-medium"
                              >
                                Update
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order._id)}
                                className="text-red-600 hover:text-red-900 font-medium"
                              >
                                Delete
                              </button>
                            </>
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

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800">
                  Order Details - #{selectedOrder._id.slice(-8).toUpperCase()}
                </h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
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

                      <div>
                        <span className="text-sm font-medium text-gray-600">Gender:</span>
                        <span className="ml-2 text-sm text-gray-800">{getGenderDisplayName(selectedOrder.gender)}</span>
                      </div>
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

                {/* Close Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Update Modal */}
        <OrderUpdateModal
          isOpen={showOrderUpdate}
          onClose={() => {
            setShowOrderUpdate(false);
            setUpdatingOrder(null);
          }}
          order={updatingOrder}
          onOrderUpdated={handleOrderUpdated}
        />
      </div>
    </div>
  );
};

export default OrderHistoryModal; 