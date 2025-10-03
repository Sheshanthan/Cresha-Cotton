import React, { useState, useEffect } from 'react';

const OrderUpdateModal = ({ isOpen, onClose, order, onOrderUpdated }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (order) {
      setFormData({
        name: order.name || '',
        email: order.email || '',
        contactNumber: order.contactNumber || '',
        deliveryLocation: order.deliveryLocation || '',
        address: order.address || '',
        description: order.description || '',
        gender: order.gender || '',
        fabricType: order.fabricType || '',
        color: order.color || '',
        fit: order.fit || '',
        sizingType: order.sizingType || '',
        standardSize: order.standardSize || '',
        customMeasurements: order.customMeasurements || {
          chest: '',
          waist: '',
          length: '',
          shoulder: ''
        },
        collarStyle: order.collarStyle || '',
        cuffType: order.cuffType || '',
        pocketStyle: order.pocketStyle || '',
        trouserFit: order.trouserFit || '',
        jacketStyle: order.jacketStyle || '',
        buttonCount: order.buttonCount || '',
        sleeveStyle: order.sleeveStyle || '',
        neckline: order.neckline || '',
        hemline: order.hemline || '',
        dressLength: order.dressLength || '',
        closure: order.closure || ''
      });
    }
  }, [order]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('customMeasurements.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        customMeasurements: {
          ...prev.customMeasurements,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${order._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          location: order.location // Keep the original location
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Order updated successfully!');
        setTimeout(() => {
          onOrderUpdated(data.order);
          onClose();
        }, 1500);
      } else {
        setError(data.message || 'Failed to update order');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">
            Update Order - #{order._id.slice(-8).toUpperCase()}
          </h3>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Basic Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Delivery Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Location *
                  </label>
                  <input
                    type="text"
                    name="deliveryLocation"
                    value={formData.deliveryLocation}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Gender-specific fields */}
          {formData.gender === 'unisex' && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Unisex Clothing Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fabric Type *
                    </label>
                    <select
                      name="fabricType"
                      value={formData.fabricType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Fabric Type</option>
                      <option value="cotton">Cotton</option>
                      <option value="linen">Linen</option>
                      <option value="silk">Silk</option>
                      <option value="wool">Wool</option>
                      <option value="polyester">Polyester</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color *
                    </label>
                    <select
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Color</option>
                      <option value="black">Black</option>
                      <option value="white">White</option>
                      <option value="blue">Blue</option>
                      <option value="red">Red</option>
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                      <option value="purple">Purple</option>
                      <option value="orange">Orange</option>
                      <option value="pink">Pink</option>
                      <option value="brown">Brown</option>
                      <option value="gray">Gray</option>
                      <option value="navy">Navy</option>
                      <option value="maroon">Maroon</option>
                      <option value="olive">Olive</option>
                      <option value="teal">Teal</option>
                      <option value="lime">Lime</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fit *
                    </label>
                    <select
                      name="fit"
                      value={formData.fit}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Fit</option>
                      <option value="slim">Slim</option>
                      <option value="regular">Regular</option>
                      <option value="loose">Loose</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sizing Type *
                    </label>
                    <select
                      name="sizingType"
                      value={formData.sizingType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Sizing Type</option>
                      <option value="standard">Standard</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  {formData.sizingType === 'standard' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Standard Size *
                      </label>
                      <select
                        name="standardSize"
                        value={formData.standardSize}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Size</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>
                  )}
                  {formData.sizingType === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Measurements *
                      </label>
                      <div className="space-y-2">
                        <input
                          type="number"
                          name="customMeasurements.chest"
                          placeholder="Chest (inches)"
                          value={formData.customMeasurements.chest}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          name="customMeasurements.waist"
                          placeholder="Waist (inches)"
                          value={formData.customMeasurements.waist}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          name="customMeasurements.length"
                          placeholder="Length (inches)"
                          value={formData.customMeasurements.length}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          name="customMeasurements.shoulder"
                          placeholder="Shoulder (inches)"
                          value={formData.customMeasurements.shoulder}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {formData.gender === 'male' && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Male Clothing Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Collar Style *
                    </label>
                    <select
                      name="collarStyle"
                      value={formData.collarStyle}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Collar Style</option>
                      <option value="classic">Classic</option>
                      <option value="spread">Spread</option>
                      <option value="button-down">Button Down</option>
                      <option value="wing">Wing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cuff Type *
                    </label>
                    <select
                      name="cuffType"
                      value={formData.cuffType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Cuff Type</option>
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="french">French</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pocket Style *
                    </label>
                    <select
                      name="pocketStyle"
                      value={formData.pocketStyle}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Pocket Style</option>
                      <option value="patch">Patch</option>
                      <option value="flap">Flap</option>
                      <option value="jetted">Jetted</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trouser Fit *
                    </label>
                    <select
                      name="trouserFit"
                      value={formData.trouserFit}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Trouser Fit</option>
                      <option value="slim">Slim</option>
                      <option value="straight">Straight</option>
                      <option value="relaxed">Relaxed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jacket Style *
                    </label>
                    <select
                      name="jacketStyle"
                      value={formData.jacketStyle}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Jacket Style</option>
                      <option value="single-breasted">Single Breasted</option>
                      <option value="double-breasted">Double Breasted</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Count *
                    </label>
                    <select
                      name="buttonCount"
                      value={formData.buttonCount}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Button Count</option>
                      <option value="1">1 Button</option>
                      <option value="2">2 Buttons</option>
                      <option value="3">3 Buttons</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {formData.gender === 'female' && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Female Clothing Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sleeve Style *
                    </label>
                    <select
                      name="sleeveStyle"
                      value={formData.sleeveStyle}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Sleeve Style</option>
                      <option value="short">Short</option>
                      <option value="long">Long</option>
                      <option value="sleeveless">Sleeveless</option>
                      <option value="cap">Cap</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Neckline *
                    </label>
                    <select
                      name="neckline"
                      value={formData.neckline}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Neckline</option>
                      <option value="v-neck">V-Neck</option>
                      <option value="round">Round</option>
                      <option value="square">Square</option>
                      <option value="scoop">Scoop</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hemline *
                    </label>
                    <select
                      name="hemline"
                      value={formData.hemline}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Hemline</option>
                      <option value="straight">Straight</option>
                      <option value="asymmetric">Asymmetric</option>
                      <option value="high-low">High-Low</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dress/Skirt Length *
                    </label>
                    <select
                      name="dressLength"
                      value={formData.dressLength}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Length</option>
                      <option value="mini">Mini</option>
                      <option value="knee-length">Knee Length</option>
                      <option value="midi">Midi</option>
                      <option value="maxi">Maxi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Closure *
                    </label>
                    <select
                      name="closure"
                      value={formData.closure}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Closure</option>
                      <option value="zipper">Zipper</option>
                      <option value="buttons">Buttons</option>
                      <option value="hook-and-eye">Hook and Eye</option>
                      <option value="elastic">Elastic</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderUpdateModal;
