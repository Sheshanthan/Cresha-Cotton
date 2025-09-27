import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminFeedbacksPage = ({ user, onLogout, onUpdateProfile }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllFeedbacks();
  }, []);

  const fetchAllFeedbacks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/feedback', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setFeedbacks(data.data);
      } else {
        setError(data.message || 'Failed to fetch feedbacks');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setError('An error occurred while fetching feedbacks');
    } finally {
      setIsLoading(false);
    }
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
          setFeedbacks(prev => prev.filter(feedback => feedback._id !== feedbackId));
          setDeleteMessage('Feedback deleted successfully!');
          setTimeout(() => setDeleteMessage(''), 3000);
        } else {
          setDeleteMessage(data.message || 'Failed to delete feedback. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting feedback:', error);
        setDeleteMessage('An error occurred while deleting feedback. Please try again.');
      }
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


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600">Loading feedbacks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Back to Admin Dashboard
            </button>
          </div>
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
              <h1 className="text-xl font-semibold text-orange-600">All Feedbacks</h1>
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
          {/* <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">All User Feedbacks</h2>
            <p className="text-gray-600">Monitor and manage feedback from all users across the platform.</p>
          </div> */}

          {/* Stats */}
          {/* <div className="mb-6 text-center">
            <div className="inline-flex items-center space-x-8 bg-white rounded-lg shadow-md px-6 py-4">
              <div>
                <span className="text-2xl font-bold text-blue-600">{feedbacks.length}</span>
                <p className="text-sm text-gray-600">Total Feedbacks</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-green-600">
                  {feedbacks.filter(f => f.rating >= 4).length}
                </span>
                <p className="text-sm text-gray-600">Positive (4-5 stars)</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-yellow-600">
                  {feedbacks.filter(f => f.rating === 3).length}
                </span>
                <p className="text-sm text-gray-600">Neutral (3 stars)</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-red-600">
                  {feedbacks.filter(f => f.rating <= 2).length}
                </span>
                <p className="text-sm text-gray-600">Negative (1-2 stars)</p>
              </div>
            </div>
          </div> */}


          {/* Delete Message */}
          {deleteMessage && (
            <div className={`mb-4 p-4 rounded-md ${
              deleteMessage.includes('successfully') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {deleteMessage}
            </div>
          )}

          {/* Feedbacks Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feedback
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feedbacks.length > 0 ? (
                    feedbacks.map((feedback) => (
                      <tr key={feedback._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(feedback.submittedAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <p className="font-medium">{feedback.customerName}</p>
                            <p className="text-gray-600">{feedback.email}</p>
                            <p className="text-gray-600">{feedback.mobileNumber}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStars(feedback.rating)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs">
                            <p className="whitespace-pre-wrap">{feedback.feedback}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => handleDeleteFeedback(feedback._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No feedbacks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminFeedbacksPage;
