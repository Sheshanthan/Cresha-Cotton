import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminReturnOrdersPage = ({ user, onLogout, onUpdateProfile }) => {
  const [returnOrders, setReturnOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReturnOrders();
  }, []);

  const fetchReturnOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/return-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch return orders');
      }
      
      const data = await response.json();
      if (data.success) {
        setReturnOrders(data.returnOrders);
      } else {
        setError(data.message || 'Failed to fetch return orders');
      }
    } catch (error) {
      console.error('Error fetching return orders:', error);
      setError('Error fetching return orders');
    } finally {
      setLoading(false);
    }
  };

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

  const updateReturnOrderStatus = async (returnOrderId, newStatus, adminNotes = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/return-orders/${returnOrderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, adminNotes })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update the local state
          setReturnOrders(prev => prev.map(ro => 
            ro._id === returnOrderId 
              ? { ...ro, status: newStatus, adminNotes }
              : ro
          ));
          alert('Return order status updated successfully!');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating return order status:', error);
      alert('Error updating return order status');
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

  const getRoleName = (role) => {
    const roleNames = { 1: 'Designer', 2: 'Buyer', 3: 'Delivery Personal' };
    return roleNames[role] || 'Unknown';
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-yellow-600">Admin Return Orders</h1>
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
                onClick={() => navigate('/admin-dashboard')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Back to Admin Dashboard
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
            <h2 className="text-2xl font-bold text-gray-900">All Return Orders</h2>
            <p className="text-gray-600 mt-1">Manage return orders from all users</p>
          </div>

          <div className="mb-6">
            <div className="text-sm text-gray-500">
              Total: {returnOrders.length}
            </div>
          </div>

          {/* Return Orders Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Info
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
                  {returnOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No return orders found
                      </td>
                    </tr>
                  ) : (
                    returnOrders.map((returnOrder) => (
                      <tr key={returnOrder._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {returnOrder.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {returnOrder.customerPhone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {returnOrder.orderId?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {returnOrder.orderId?.description || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ${returnOrder.orderId?.price || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {returnOrder.userId?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {returnOrder.userId?.email || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getRoleName(returnOrder.userId?.role || 0)}
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
                          <div className="flex flex-col space-y-2">
                            <select
                              value={returnOrder.status}
                              onChange={(e) => updateReturnOrderStatus(returnOrder._id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                            </select>
                            <button
                              onClick={() => {
                                const notes = prompt('Enter admin notes (optional):');
                                if (notes !== null) {
                                  updateReturnOrderStatus(returnOrder._id, returnOrder.status, notes);
                                }
                              }}
                              className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors duration-200"
                            >
                              Add Notes
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminReturnOrdersPage;
