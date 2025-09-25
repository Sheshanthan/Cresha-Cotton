import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FeedbackPage = ({ user, onLogout, onUpdateProfile }) => {
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    email: user?.email || '',
    mobileNumber: '',
    feedback: '',
    rating: 0
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showMyFeedbacks, setShowMyFeedbacks] = useState(false);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating: rating
    }));
  };

  const handleRatingHover = (rating) => {
    setHoveredRating(rating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.email || !formData.mobileNumber || !formData.feedback || formData.rating === 0) {
      setSubmitMessage('Please fill in all fields and provide a rating');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage('Feedback submitted successfully! Thank you for your input.');
        setFormData({
          customerName: user?.name || '',
          email: user?.email || '',
          mobileNumber: '',
          feedback: '',
          rating: 0
        });
        setHoveredRating(0);
        
        // Refresh the feedback list if it's currently displayed
        if (showMyFeedbacks) {
          fetchUserFeedbacks();
        }
      } else {
        setSubmitMessage(data.message || 'Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitMessage('An error occurred while submitting feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  const fetchUserFeedbacks = async () => {
    setIsLoadingFeedbacks(true);
    try {
      const response = await fetch('http://localhost:5000/api/feedback/user/my', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUserFeedbacks(data.data);
      } else {
        console.error('Failed to fetch feedbacks:', data.message);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  const handleMyFeedbacksClick = () => {
    if (!showMyFeedbacks) {
      fetchUserFeedbacks();
    }
    setShowMyFeedbacks(!showMyFeedbacks);
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/feedback/${feedbackId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();

        if (data.success) {
          // Remove the deleted feedback from the list
          setUserFeedbacks(prev => prev.filter(feedback => feedback._id !== feedbackId));
          setSubmitMessage('Feedback deleted successfully!');
          setTimeout(() => setSubmitMessage(''), 3000);
        } else {
          setSubmitMessage(data.message || 'Failed to delete feedback. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting feedback:', error);
        setSubmitMessage('An error occurred while deleting feedback. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            {star <= rating ? '★' : '☆'}
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-green-600">Feedback</h1>
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

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Share Your Feedback</h2>
            <p className="text-gray-600">We value your opinion! Help us improve our services by sharing your experience.</p>
          </div>

          {/* My Feedbacks Button */}
          <div className="mb-6 text-center">
            <button
              onClick={handleMyFeedbacksClick}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {showMyFeedbacks ? 'Hide My Feedbacks' : 'My Feedbacks'}
            </button>
          </div>

          {/* My Feedbacks Table */}
          {showMyFeedbacks && (
            <div className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">My Feedback History</h3>
              </div>
              {isLoadingFeedbacks ? (
                <div className="p-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="mt-2 text-gray-600">Loading your feedbacks...</p>
                </div>
              ) : userFeedbacks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Feedback
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userFeedbacks.map((feedback) => (
                        <tr key={feedback._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(feedback.submittedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStars(feedback.rating)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs">
                              <p className="truncate">{feedback.feedback}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div>
                              <p className="font-medium">{feedback.customerName}</p>
                              <p className="text-gray-600">{feedback.email}</p>
                              <p className="text-gray-600">{feedback.mobileNumber}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => navigate(`/feedback/update/${feedback._id}`)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200"
                              >
                                Update
                              </button>
                              <button
                                onClick={() => handleDeleteFeedback(feedback._id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-600">
                  <p>You haven't submitted any feedback yet.</p>
                  <p className="mt-1">Submit your first feedback using the form below!</p>
                </div>
              )}
            </div>
          )}

          {/* Feedback Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Name */}
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your mobile number"
                  required
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => handleRatingHover(star)}
                      onMouseLeave={() => handleRatingHover(0)}
                      className="text-3xl focus:outline-none transition-colors duration-200"
                    >
                      {star <= (hoveredRating || formData.rating) ? (
                        <span className="text-yellow-400">★</span>
                      ) : (
                        <span className="text-gray-300">☆</span>
                      )}
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.rating > 0 ? `${formData.rating} star${formData.rating > 1 ? 's' : ''}` : 'Click to rate'}
                  </span>
                </div>
              </div>

              {/* Feedback Text Area */}
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Feedback *
                </label>
                <textarea
                  id="feedback"
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Please share your experience, suggestions, or any feedback you have..."
                  required
                />
              </div>

              {/* Submit Message */}
              {submitMessage && (
                <div className={`p-4 rounded-md ${
                  submitMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {submitMessage}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FeedbackPage;
