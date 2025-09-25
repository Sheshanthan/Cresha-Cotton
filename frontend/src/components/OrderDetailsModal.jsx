import React, { useState } from 'react';

const OrderDetailsModal = ({ order, isOpen, onClose, onDeliver }) => {

  if (!isOpen || !order) return null;

  const handleDeliver = () => {
    if (onDeliver) {
      onDeliver(order._id);
    }
  };



  const getGenderDisplayName = (gender) => {
    const genderNames = {
      'male': 'Male',
      'female': 'Female',
      'unisex': 'Unisex'
    };
    return genderNames[gender] || gender;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column - Order Details */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">#{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium">{formatDate(order.orderDate)}</span>
                  </div>
                  {order.fabricType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fabric Type:</span>
                      <span className="font-medium capitalize">{order.fabricType}</span>
                    </div>
                  )}
                  {order.color && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Color:</span>
                      <div className="flex items-center space-x-2">
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
                        <span className="font-medium capitalize">{order.color}</span>
                      </div>
                    </div>
                  )}
                  {order.fit && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fit:</span>
                      <span className="font-medium capitalize">{order.fit}</span>
                    </div>
                  )}
                  {order.sizingType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sizing:</span>
                      <span className="font-medium capitalize">{order.sizingType}</span>
                    </div>
                  )}
                  {order.standardSize && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Standard Size:</span>
                      <span className="font-medium">{order.standardSize}</span>
                    </div>
                  )}
                  {order.customMeasurements && order.customMeasurements.chest && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Custom Measurements:</span>
                      <span className="font-medium text-sm">
                        Chest: {order.customMeasurements.chest}", Waist: {order.customMeasurements.waist}", 
                        Length: {order.customMeasurements.length}", Shoulder: {order.customMeasurements.shoulder}"
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">{getGenderDisplayName(order.gender)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{getStatusDisplayName(order.status)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Name:</span>
                    <span className="font-medium text-blue-900">{order.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Email:</span>
                    <span className="font-medium text-blue-900">{order.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Contact Number:</span>
                    <span className="font-medium text-blue-900">{order.contactNumber}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Delivery Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-700">Delivery Location:</span>
                    <span className="font-medium text-green-900">{order.deliveryLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Address:</span>
                    <span className="font-medium text-green-900">{order.address || 'Not specified'}</span>
                  </div>
                  {order.description && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Description:</span>
                      <span className="font-medium text-green-900">{order.description}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Delivery Address */}
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">Delivery Address</h3>
                <div className="bg-white p-4 rounded-lg border-2 border-yellow-200">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-900">Delivery Address:</div>
                        <div className="text-gray-700 mt-1">{order.address || order.deliveryLocation || 'Address not specified'}</div>
                      </div>
                    </div>
                    {order.deliveryLocation && order.deliveryLocation !== order.address && (
                      <div className="text-sm text-gray-500 mt-2">
                        <span className="font-medium">Coordinates:</span> {order.deliveryLocation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleDeliver}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Mark as Delivered
            </button>
            
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Close
            </button>
          </div>


        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal; 