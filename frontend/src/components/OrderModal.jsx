import React, { useState, useEffect } from 'react';
import ProfileModal from './ProfileModal';
import PaymentForm from './PaymentForm';

const OrderModal = ({ isOpen, onClose, user, onOrderPlaced }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    deliveryLocation: '',
    address: '',
    description: '',
    gender: '',
    fabricType: '',
    color: '',
    fit: '',
    sizingType: '',
    standardSize: '',
    customMeasurements: {},
    collarStyle: '',
    cuffType: '',
    pocketStyle: '',
    trouserFit: '',
    jacketStyle: '',
    buttonCount: '',
    sleeveStyle: '',
    neckline: '',
    hemline: '',
    dressLength: '',
    closure: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPricingView, setShowPricingView] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        contactNumber: user.phone || '',
        deliveryLocation: '',
        address: '',
        description: '',
        gender: '',
        fabricType: '',
        color: '',
        fit: '',
        sizingType: '',
        standardSize: '',
        customMeasurements: {},
        collarStyle: '',
        cuffType: '',
        pocketStyle: '',
        trouserFit: '',
        jacketStyle: '',
        buttonCount: '',
        sleeveStyle: '',
        neckline: '',
        hemline: '',
        dressLength: '',
        closure: ''
      });
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('Form submitted, payment method:', paymentMethod);

    if (!formData.address.trim()) {
      setError('Please enter a delivery address');
      return;
    }

    if (!formData.gender) {
      setError('Please select gender');
      return;
    }

    if (formData.gender === 'unisex' && (!formData.fabricType || !formData.color || !formData.fit)) {
      setError('Please select fabric type, color, and fit for unisex clothing');
      return;
    }

    if (formData.gender === 'unisex' && !formData.sizingType) {
      setError('Please select a sizing option for unisex clothing');
      return;
    }

    if (formData.gender === 'unisex' && formData.sizingType === 'standard' && !formData.standardSize) {
      setError('Please select a standard size for unisex clothing');
      return;
    }

    if (formData.gender === 'unisex' && formData.sizingType === 'custom' && 
        (!formData.customMeasurements.chest || !formData.customMeasurements.waist || 
         !formData.customMeasurements.length || !formData.customMeasurements.shoulder)) {
      setError('Please provide all custom measurements for unisex clothing');
      return;
    }

    // Validate male-specific fields
    if (formData.gender === 'male' && (!formData.collarStyle || !formData.cuffType || !formData.pocketStyle || !formData.trouserFit || !formData.jacketStyle || !formData.buttonCount)) {
      setError('Please select all required fields for male clothing');
      return;
    }

    // Validate female-specific fields
    if (formData.gender === 'female' && (!formData.sleeveStyle || !formData.neckline || !formData.hemline || !formData.dressLength || !formData.closure)) {
      setError('Please select all required fields for female clothing');
      return;
    }

    console.log('Validation passed, proceeding with order...');

    // Check if user wants to pay now or COD
    if (paymentMethod === 'paynow') {
      console.log('Pay Now selected, creating order and showing payment form...');
      // For Pay Now, create order and go directly to payment
      await createOrderAndShowPayment();
    } else {
      console.log('COD selected, showing pricing view...');
      // For COD, show pricing view first
      setShowPricingView(true);
    }
  };

  const getPrice = () => {
    switch (formData.gender) {
      case 'female':
        return 2500;
      case 'male':
        return 2000;
      case 'unisex':
        return 1900;
      default:
        return 0;
    }
  };

  const handleConfirmOrder = async () => {
    if (paymentMethod === 'paynow') {
      // For Pay Now, first create the order, then show payment form
      await createOrderAndShowPayment();
    } else {
      // For COD, create order directly
      await createOrder();
    }
  };

  const createOrderAndShowPayment = async () => {
    console.log('Starting createOrderAndShowPayment...');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const orderData = prepareOrderData();
      
      console.log('Order data prepared:', orderData);

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      console.log('Order creation response:', data);

      if (data.success) {
        console.log('Order created successfully, order ID:', data.order._id);
        setOrderId(data.order._id);
        setShowPaymentForm(true);
        setShowPricingView(false);
        console.log('Payment form should now be visible');
      } else {
        console.error('Failed to create order:', data.message);
        setError(data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error in createOrderAndShowPayment:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const orderData = prepareOrderData();

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Order placed successfully!');
        resetForm();
        
        if (onOrderPlaced) {
          onOrderPlaced();
        }
        
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.message || 'Failed to place order');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const prepareOrderData = () => {
    const orderData = {
      name: formData.name,
      email: formData.email,
      contactNumber: formData.contactNumber,
      deliveryLocation: formData.address, // Use address as delivery location since map is removed
      address: formData.address,
      description: formData.description,
      gender: formData.gender,
      location: { lat: 0, lng: 0 }, // Default coordinates since map is removed
      userId: user._id || user.id,
      orderDate: new Date().toISOString(),
      price: getPrice(),
      paymentMethod: paymentMethod
    };


    // Add gender-specific fields
    if (formData.gender === 'unisex') {
      if (formData.fabricType) orderData.fabricType = formData.fabricType;
      if (formData.color) orderData.color = formData.color;
      if (formData.fit) orderData.fit = formData.fit;
      if (formData.sizingType) orderData.sizingType = formData.sizingType;
      if (formData.standardSize) orderData.standardSize = formData.standardSize;
      if (formData.customMeasurements && Object.keys(formData.customMeasurements).length > 0) {
        orderData.customMeasurements = formData.customMeasurements;
      }
    } else if (formData.gender === 'male') {
      if (formData.collarStyle) orderData.collarStyle = formData.collarStyle;
      if (formData.cuffType) orderData.cuffType = formData.cuffType;
      if (formData.pocketStyle) orderData.pocketStyle = formData.pocketStyle;
      if (formData.trouserFit) orderData.trouserFit = formData.trouserFit;
      if (formData.jacketStyle) orderData.jacketStyle = formData.jacketStyle;
      if (formData.buttonCount) orderData.buttonCount = formData.buttonCount;
    } else if (formData.gender === 'female') {
      if (formData.sleeveStyle) orderData.sleeveStyle = formData.sleeveStyle;
      if (formData.neckline) orderData.neckline = formData.neckline;
      if (formData.hemline) orderData.hemline = formData.hemline;
      if (formData.dressLength) orderData.dressLength = formData.dressLength;
      if (formData.closure) orderData.closure = formData.closure;
    }

    return orderData;
  };

  const resetForm = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      contactNumber: user?.phone || '',
      deliveryLocation: '', // This will be set to address when submitting
      address: '',
      description: '',
      gender: '',
      fabricType: '',
      color: '',
      fit: '',
      sizingType: '',
      standardSize: '',
      customMeasurements: {},
      collarStyle: '',
      cuffType: '',
      pocketStyle: '',
      trouserFit: '',
      jacketStyle: '',
      buttonCount: '',
      sleeveStyle: '',
      neckline: '',
      hemline: '',
      dressLength: '',
      closure: ''
    });
    setPaymentMethod('cod');
    setShowPricingView(false);
    setShowPaymentForm(false);
    setOrderId(null);
  };

  const handleBackToForm = () => {
    setShowPricingView(false);
    setError('');
  };

  const handleBackToPricing = () => {
    setShowPaymentForm(false);
    setShowPricingView(true);
  };

  if (!isOpen) return null;

  // Show Payment Form
  if (showPaymentForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-xl font-bold text-gray-800">
              Complete Payment
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                LKR {getPrice().toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Complete your payment to confirm your order
              </div>
            </div>

            <PaymentForm 
              amount={getPrice()}
              orderId={orderId}
              onSuccess={() => {
                setSuccess('Payment successful! Order confirmed.');
                resetForm();
                if (onOrderPlaced) {
                  onOrderPlaced();
                }
                setTimeout(() => {
                  onClose();
                }, 2000);
              }}
              onError={(error) => setError(error)}
            />

            <div className="flex justify-center">
              <button
                onClick={handleBackToPricing}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Back to Order Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Pricing View
  if (showPricingView) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-xl font-bold text-gray-800">
              Order Summary
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Order Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium capitalize">{formData.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="font-medium">{formData.address || 'Location selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-medium">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pay Now'}</span>
                </div>
              </div>
            </div>

            {/* Price Display */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                LKR {getPrice().toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formData.gender === 'female' && 'Female clothing price'}
                {formData.gender === 'male' && 'Male clothing price'}
                {formData.gender === 'unisex' && 'Unisex clothing price'}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleBackToForm}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Back to Edit
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Order Form
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Place Order</h2>
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
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            {/* Conditional fields for Unisex gender */}
            {formData.gender === 'unisex' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fabric Type *
                  </label>
                  <select
                    name="fabricType"
                    value={formData.fabricType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Fabric Type</option>
                    <option value="cotton">Cotton</option>
                    <option value="linen">Linen</option>
                    <option value="silk">Silk</option>
                    <option value="denim">Denim</option>
                    <option value="rayon">Rayon</option>
                    <option value="polyester">Polyester</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color *
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {[
                      { name: 'black', hex: '#000000', label: 'Black' },
                      { name: 'white', hex: '#FFFFFF', label: 'White' },
                      { name: 'blue', hex: '#3B82F6', label: 'Blue' },
                      { name: 'red', hex: '#EF4444', label: 'Red' },
                      { name: 'green', hex: '#10B981', label: 'Green' },
                      { name: 'yellow', hex: '#F59E0B', label: 'Yellow' },
                      { name: 'purple', hex: '#8B5CF6', label: 'Purple' },
                      { name: 'orange', hex: '#F97316', label: 'Orange' },
                      { name: 'pink', hex: '#EC4899', label: 'Pink' },
                      { name: 'brown', hex: '#A16207', label: 'Brown' },
                      { name: 'gray', hex: '#6B7280', label: 'Gray' },
                      { name: 'navy', hex: '#1E3A8A', label: 'Navy' },
                      { name: 'maroon', hex: '#991B1B', label: 'Maroon' },
                      { name: 'olive', hex: '#65A30D', label: 'Olive' },
                      { name: 'teal', hex: '#0D9488', label: 'Teal' },
                      { name: 'lime', hex: '#84CC16', label: 'Lime' }
                    ].map((color) => (
                      <div key={color.name} className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, color: color.name })}
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                            formData.color === color.name 
                              ? 'border-gray-800 shadow-lg' 
                              : 'border-gray-300 hover:border-gray-500'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.label}
                        />
                        <span className="text-xs text-gray-600 mt-1 text-center">
                          {color.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  {formData.color && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: <span className="font-medium capitalize">{formData.color}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fit *
                  </label>
                  <select
                    name="fit"
                    value={formData.fit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Fit</option>
                    <option value="fitted">Fitted</option>
                    <option value="regular">Regular</option>
                    <option value="relaxed">Relaxed</option>
                    <option value="baggy">Baggy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sizing *
                  </label>
                  <div className="space-y-3">
                    {/* Standard Sizes */}
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="sizingType"
                          value="standard"
                          checked={formData.sizingType === 'standard'}
                          onChange={(e) => setFormData({ ...formData, sizingType: e.target.value, customMeasurements: {} })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Standard Sizes</span>
                      </label>
                      {formData.sizingType === 'standard' && (
                        <select
                          name="standardSize"
                          value={formData.standardSize || ''}
                          onChange={handleChange}
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Size</option>
                          <option value="S">Small (S)</option>
                          <option value="M">Medium (M)</option>
                          <option value="L">Large (L)</option>
                          <option value="XL">Extra Large (XL)</option>
                        </select>
                      )}
                    </div>

                    {/* Custom Measurements */}
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="sizingType"
                          value="custom"
                          checked={formData.sizingType === 'custom'}
                          onChange={(e) => setFormData({ ...formData, sizingType: e.target.value, standardSize: '' })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Custom Measurements</span>
                      </label>
                      {formData.sizingType === 'custom' && (
                        <div className="mt-2 grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Chest (inches)</label>
                            <input
                              type="number"
                              name="chest"
                              value={formData.customMeasurements?.chest || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                customMeasurements: {
                                  ...formData.customMeasurements,
                                  chest: e.target.value
                                }
                              })}
                              placeholder="e.g., 38"
                              min="20"
                              max="60"
                              step="0.5"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Waist (inches)</label>
                            <input
                              type="number"
                              name="waist"
                              value={formData.customMeasurements?.waist || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                customMeasurements: {
                                  ...formData.customMeasurements,
                                  waist: e.target.value
                                }
                              })}
                              placeholder="e.g., 32"
                              min="20"
                              max="60"
                              step="0.5"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Length (inches)</label>
                            <input
                              type="number"
                              name="length"
                              value={formData.customMeasurements?.length || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                customMeasurements: {
                                  ...formData.customMeasurements,
                                  length: e.target.value
                                }
                              })}
                              placeholder="e.g., 28"
                              min="20"
                              max="60"
                              step="0.5"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Shoulder (inches)</label>
                            <input
                              type="number"
                              name="shoulder"
                              value={formData.customMeasurements?.shoulder || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                customMeasurements: {
                                  ...formData.customMeasurements,
                                  shoulder: e.target.value
                                }
                              })}
                              placeholder="e.g., 16"
                              min="10"
                              max="30"
                              step="0.5"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Conditional fields for Male gender */}
            {formData.gender === 'male' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collar Style *
                  </label>
                  <select
                    name="collarStyle"
                    value={formData.collarStyle}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Collar Style</option>
                    <option value="spread">Spread</option>
                    <option value="point">Point</option>
                    <option value="button-down">Button-down</option>
                    <option value="mandarin">Mandarin</option>
                    <option value="wing">Wing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuff Type *
                  </label>
                  <select
                    name="cuffType"
                    value={formData.cuffType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Cuff Type</option>
                    <option value="single">Single</option>
                    <option value="french">French</option>
                    <option value="barrel">Barrel</option>
                    <option value="round">Round</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pocket Style *
                  </label>
                  <select
                    name="pocketStyle"
                    value={formData.pocketStyle}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Pocket Style</option>
                    <option value="flap">Flap</option>
                    <option value="patch">Patch</option>
                    <option value="no-pocket">No Pocket</option>
                    <option value="slanted">Slanted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trouser Fit *
                  </label>
                  <select
                    name="trouserFit"
                    value={formData.trouserFit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Trouser Fit</option>
                    <option value="straight">Straight</option>
                    <option value="slim">Slim</option>
                    <option value="tapered">Tapered</option>
                    <option value="bootcut">Bootcut</option>
                    <option value="relaxed">Relaxed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jacket Details *
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Jacket Style</label>
                      <select
                        name="jacketStyle"
                        value={formData.jacketStyle}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Jacket Style</option>
                        <option value="single-breasted">Single-breasted</option>
                        <option value="double-breasted">Double-breasted</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Number of Buttons</label>
                      <select
                        name="buttonCount"
                        value={formData.buttonCount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Button Count</option>
                        <option value="1">1 Button</option>
                        <option value="2">2 Buttons</option>
                        <option value="3">3 Buttons</option>
                        <option value="4">4 Buttons</option>
                        <option value="5">5 Buttons</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Conditional fields for Female gender */}
            {formData.gender === 'female' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleeve Style *
                  </label>
                  <select
                    name="sleeveStyle"
                    value={formData.sleeveStyle}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Sleeve Style</option>
                    <option value="sleeveless">Sleeveless</option>
                    <option value="capped">Capped</option>
                    <option value="short">Short</option>
                    <option value="three-quarter">3/4 Length</option>
                    <option value="full">Full</option>
                    <option value="bell">Bell</option>
                    <option value="puff">Puff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Neckline *
                  </label>
                  <select
                    name="neckline"
                    value={formData.neckline}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Neckline</option>
                    <option value="crew">Crew</option>
                    <option value="v-neck">V-neck</option>
                    <option value="scoop">Scoop</option>
                    <option value="halter">Halter</option>
                    <option value="strapless">Strapless</option>
                    <option value="off-shoulder">Off-shoulder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hemline *
                  </label>
                  <select
                    name="hemline"
                    value={formData.hemline}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Hemline</option>
                    <option value="cropped">Cropped</option>
                    <option value="tunic">Tunic</option>
                    <option value="asymmetrical">Asymmetrical</option>
                    <option value="high-low">High-low</option>
                    <option value="curved">Curved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dress/Skirt Length *
                  </label>
                  <select
                    name="dressLength"
                    value={formData.dressLength}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Length</option>
                    <option value="mini">Mini</option>
                    <option value="knee-length">Knee-length</option>
                    <option value="midi">Midi</option>
                    <option value="maxi">Maxi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closure *
                  </label>
                  <select
                    name="closure"
                    value={formData.closure}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Closure</option>
                    <option value="buttons">Buttons</option>
                    <option value="zipper">Zipper</option>
                    <option value="snap">Snap</option>
                    <option value="lace-up">Lace-up</option>
                  </select>
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your order requirements..."
              />
            </div>
          </div>

          {/* Delivery Address Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your complete delivery address..."
            />
          </div>

          {/* Payment Method Selection */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Payment Method</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Cash on Delivery (COD)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paynow"
                  checked={paymentMethod === 'paynow'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Pay Now</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
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
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal; 