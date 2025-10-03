import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import Register from './components/Register'
import AdminDashboard from './components/AdminDashboard'
import DesignerView from './components/DesignerView'
import BuyerView from './components/BuyerView'
import DeliveryPersonalView from './components/DeliveryPersonalView'
import OwnerDashboard from './components/OwnerDashboard'
import OrdersPage from './components/OrdersPage'
import ProfilePage from './components/ProfilePage'
import ProductsPage from './components/ProductsPage'
import AdminOrdersPage from './components/AdminOrdersPage'
import FeedbackPage from './components/FeedbackPage'
import UpdateFeedbackPage from './components/UpdateFeedbackPage'
import AdminFeedbacksPage from './components/AdminFeedbacksPage'
import AdminReturnOrdersPage from './components/AdminReturnOrdersPage'
import ReturnOrdersPage from './components/ReturnOrdersPage'
import EditReturnOrderPage from './components/EditReturnOrderPage'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Function to render the appropriate view based on user role
  const renderUserView = (user) => {
    if (user.role === 'admin') {
      return <AdminDashboard user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />;
    } else if (user.role === 'owner') {
      return <OwnerDashboard user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />;
    } else if (user.role === 1) {
      return <DesignerView user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />;
    } else if (user.role === 2) {
      return <BuyerView user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />;
    } else if (user.role === 3) {
      return <DeliveryPersonalView user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />;
    } else {
      return <AdminDashboard user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            user ? <Navigate to="/dashboard" replace /> : <Dashboard />
          } />
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/dashboard" replace /> : <Register />
          } />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            user ? renderUserView(user) : <Navigate to="/login" replace />
          } />
          
          {/* Orders page for buyers */}
          <Route path="/orders" element={
            user ? <OrdersPage user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} /> : <Navigate to="/login" replace />
          } />
          
          {/* Products page for owners */}
          <Route path="/products" element={
            user ? <ProductsPage user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} /> : <Navigate to="/login" replace />
          } />
          
          {/* Admin orders page */}
          <Route path="/admin-orders" element={
            user ? <AdminOrdersPage user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} /> : <Navigate to="/login" replace />
          } />
          
          {/* Profile page for all users */}
          <Route path="/profile" element={
            user ? <ProfilePage user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} /> : <Navigate to="/login" replace />
          } />
          
          {/* Feedback page for all users */}
          <Route path="/feedback" element={
            user ? <FeedbackPage user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} /> : <Navigate to="/login" replace />
          } />
          
          {/* Update Feedback page for all users */}
          <Route path="/feedback/update/:feedbackId" element={
            user ? <UpdateFeedbackPage user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} /> : <Navigate to="/login" replace />
          } />
          
          {/* Admin Feedbacks page - admin only */}
          <Route path="/admin-feedbacks" element={
            user && user.role === 'admin' ? <AdminFeedbacksPage user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} /> : <Navigate to="/login" replace />
          } />
          
          {/* Admin Return Orders page - admin only */}
          <Route path="/admin-return-orders" element={
            user && user.role === 'admin' ? <AdminReturnOrdersPage user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} /> : <Navigate to="/login" replace />
          } />
          
          {/* Return Orders page for buyers */}
  <Route path="/return-orders" element={
    user ? <ReturnOrdersPage user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} /> : <Navigate to="/login" replace />
  } />
  
  {/* Edit Return Order page for buyers */}
  <Route path="/return-orders/edit/:id" element={
    user ? <EditReturnOrderPage user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} /> : <Navigate to="/login" replace />
  } />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
