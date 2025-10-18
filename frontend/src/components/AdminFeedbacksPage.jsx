import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminFeedbacksPage = ({ user, onLogout, onUpdateProfile }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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

  // Fallback function to create simple table without autoTable
  const createSimpleTable = (doc, tableData) => {
    try {
      let yPosition = 50;
      let currentPage = 1;
      
      // Add headers with better styling
      doc.setFillColor(220, 38, 38);
      doc.setTextColor(255, 255, 255);
      doc.rect(10, yPosition, 190, 12, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Customer Name', 12, yPosition + 8);
      doc.text('Email', 45, yPosition + 8);
      doc.text('Mobile', 85, yPosition + 8);
      doc.text('Rating', 115, yPosition + 8);
      doc.text('Date', 140, yPosition + 8);
      doc.text('Feedback', 170, yPosition + 8);
      yPosition += 15;
      
      // Add data rows with better formatting
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      
      tableData.forEach((row, index) => {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          currentPage++;
          yPosition = 30;
          
          // Add headers on new page
          doc.setFillColor(220, 38, 38);
          doc.setTextColor(255, 255, 255);
          doc.rect(10, yPosition, 190, 12, 'F');
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('Customer Name', 12, yPosition + 8);
          doc.text('Email', 45, yPosition + 8);
          doc.text('Mobile', 85, yPosition + 8);
          doc.text('Rating', 115, yPosition + 8);
          doc.text('Date', 140, yPosition + 8);
          doc.text('Feedback', 170, yPosition + 8);
          yPosition += 15;
        }
        
        // Alternate row colors for better readability
        if (index % 2 === 0) {
          doc.setFillColor(248, 249, 250);
          doc.rect(10, yPosition, 190, 10, 'F');
        }
        
        // Add borders for better table structure
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.rect(10, yPosition, 190, 10);
        
        // Add cell content with better spacing
        doc.text(row[0] || 'N/A', 12, yPosition + 7);
        doc.text(row[1] || 'N/A', 45, yPosition + 7);
        doc.text(row[2] || 'N/A', 85, yPosition + 7);
        doc.text(row[3] || 'N/A', 115, yPosition + 7);
        doc.text(row[4] || 'N/A', 140, yPosition + 7);
        
        // Handle long feedback text
        const feedbackText = row[5] || 'N/A';
        if (feedbackText.length > 25) {
          doc.text(feedbackText.substring(0, 25) + '...', 170, yPosition + 7);
        } else {
          doc.text(feedbackText, 170, yPosition + 7);
        }
        
        yPosition += 12;
      });
      
      console.log('Simple table created successfully with', currentPage, 'pages');
    } catch (error) {
      console.error('Error creating simple table:', error);
      throw error;
    }
  };

  // Generate PDF of all feedbacks
  const generateFeedbacksPDF = () => {
    // Check if there are feedbacks to generate
    if (!feedbacks || feedbacks.length === 0) {
      alert('No feedbacks available to generate PDF.');
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      console.log('Starting PDF generation...');
      console.log('Feedbacks count:', feedbacks.length);
      
      // Create new PDF document
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('All Customer Feedbacks', 14, 22);
      
      // Add generation info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
      doc.text(`Total Feedbacks: ${feedbacks.length}`, 14, 42);
      
      // Prepare table data with better error handling and text formatting
      const tableData = feedbacks.map(feedback => {
        try {
          // Truncate long feedback text for better table display
          const feedbackText = feedback.feedback || 'N/A';
          const truncatedFeedback = feedbackText.length > 60 ? 
            feedbackText.substring(0, 60) + '...' : feedbackText;
          
          return [
            feedback.customerName || 'N/A',
            feedback.email || 'N/A',
            feedback.mobileNumber || 'N/A',
            `${feedback.rating || 0} ⭐`,
            feedback.submittedAt ? formatDate(feedback.submittedAt) : 'N/A',
            truncatedFeedback
          ];
        } catch (err) {
          console.warn('Error processing feedback:', feedback, err);
          return ['Error', 'Error', 'Error', '0 ⭐', 'N/A', 'Error processing feedback'];
        }
      });
      
      console.log('Table data prepared:', tableData.length, 'rows');
      
      // Add table with improved formatting and multi-page support
      if (doc.autoTable) {
        try {
          doc.autoTable({
            head: [['Customer Name', 'Email', 'Mobile', 'Rating', 'Date', 'Feedback']],
            body: tableData,
            startY: 50,
            styles: {
              fontSize: 9,
              cellPadding: 4,
              overflow: 'linebreak',
              halign: 'left',
              valign: 'middle',
              lineColor: [200, 200, 200],
              lineWidth: 0.5
            },
            headStyles: {
              fillColor: [220, 38, 38], // Red color for admin theme
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 10,
              cellPadding: 5
            },
            alternateRowStyles: {
              fillColor: [248, 249, 250]
            },
            columnStyles: {
              0: { cellWidth: 30, halign: 'left' }, // Customer Name
              1: { cellWidth: 40, halign: 'left' }, // Email
              2: { cellWidth: 25, halign: 'center' }, // Mobile
              3: { cellWidth: 20, halign: 'center' }, // Rating
              4: { cellWidth: 30, halign: 'center' }, // Date
              5: { cellWidth: 45, halign: 'left' }  // Feedback
            },
            margin: { left: 10, right: 10 },
            pageBreak: 'auto',
            showHead: 'everyPage',
            didDrawPage: function (data) {
              // Add page numbers
              const pageCount = doc.internal.getNumberOfPages();
              const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
              doc.setFontSize(8);
              doc.setTextColor(128, 128, 128);
              doc.text(`Page ${currentPage} of ${pageCount}`, 
                doc.internal.pageSize.width - 30, 
                doc.internal.pageSize.height - 10);
            }
          });
          console.log('Table added successfully with autoTable');
        } catch (autoTableError) {
          console.warn('autoTable failed, using fallback method:', autoTableError);
          // Fallback: create simple table manually
          createSimpleTable(doc, tableData);
        }
      } else {
        console.warn('autoTable not available, using fallback method');
        // Fallback: create simple table manually
        createSimpleTable(doc, tableData);
      }
      
      // Add summary statistics with better formatting
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 200;
      
      // Add a separator line
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(1);
      doc.line(14, finalY - 5, 196, finalY - 5);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text('Summary Statistics', 14, finalY);
      
      // Calculate statistics with error handling
      const ratings = feedbacks.map(f => f.rating || 0).filter(r => r > 0);
      if (ratings.length > 0) {
        const avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
        const positiveCount = ratings.filter(r => r >= 4).length;
        const neutralCount = ratings.filter(r => r === 3).length;
        const negativeCount = ratings.filter(r => r <= 2).length;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        // Create a nice summary box
        const summaryY = finalY + 10;
        doc.setFillColor(248, 249, 250);
        doc.rect(14, summaryY - 5, 182, 50, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(14, summaryY - 5, 182, 50);
        
        doc.text(`Average Rating: ${avgRating} ⭐`, 20, summaryY + 5);
        doc.text(`Positive (4-5 stars): ${positiveCount} feedbacks (${((positiveCount/ratings.length)*100).toFixed(1)}%)`, 20, summaryY + 12);
        doc.text(`Neutral (3 stars): ${neutralCount} feedbacks (${((neutralCount/ratings.length)*100).toFixed(1)}%)`, 20, summaryY + 19);
        doc.text(`Negative (1-2 stars): ${negativeCount} feedbacks (${((negativeCount/ratings.length)*100).toFixed(1)}%)`, 20, summaryY + 26);
        doc.text(`Total Feedbacks Analyzed: ${ratings.length}`, 20, summaryY + 33);
      }
      
      // Generate filename
      const filename = `all-feedbacks-${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('Saving PDF as:', filename);
      
      // Save PDF
      doc.save(filename);
      console.log('PDF saved successfully');
      
    } catch (error) {
      console.error('Detailed PDF generation error:', error);
      console.error('Error stack:', error.stack);
      
      // More specific error messages
      let errorMessage = 'Failed to generate PDF. ';
      if (error.message.includes('autoTable')) {
        errorMessage += 'PDF table plugin not available.';
      } else if (error.message.includes('font')) {
        errorMessage += 'Font loading issue.';
      } else if (error.message.includes('save')) {
        errorMessage += 'Download blocked by browser.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      // Use a more user-friendly notification instead of alert
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc2626;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      notification.textContent = errorMessage;
      document.body.appendChild(notification);
      
      // Remove notification after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
      
    } finally {
      setIsGeneratingPDF(false);
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

  // Filter feedbacks based on search term and rating filter
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = 
      feedback.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.feedback?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === '' || feedback.rating === parseInt(filterRating);
    
    return matchesSearch && matchesRating;
  });

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

          {/* Filters and Search */}
          <div className="mb-6 bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, or feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={generateFeedbacksPDF}
                  disabled={isGeneratingPDF || feedbacks.length === 0}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>📄</span>
                      <span>Generate PDF</span>
                    </>
                  )}
                </button>
                <div className="text-sm text-gray-600">
                  Showing {filteredFeedbacks.length} of {feedbacks.length} feedbacks
                </div>
              </div>
            </div>
          </div>

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
                  {filteredFeedbacks.length > 0 ? (
                    filteredFeedbacks.map((feedback) => (
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
                        {searchTerm || filterRating ? 'No feedbacks match your filters.' : 'No feedbacks found.'}
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
