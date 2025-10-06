import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './context/AuthContext';

// Import our UI components
import LoadingScreen from './components/ui/LoadingScreen';
import MainLayout from './components/layout/MainLayout';

// Import page components
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import ProductDetail from './components/ProductDetail';
import MyListings from './components/MyListings';
import AdminDashboard from './components/AdminDashboard';
import OrderHistory from './components/OrderHistory';
import OrderDetails from './components/OrderDetails';

// Admin-specific layout without regular navigation
const AdminLayout = ({ children }) => {
  return (
    <Box component="main" sx={{ minHeight: '100vh' }}>
      {children}
    </Box>
  );
};

// Create a route wrapper for private routes
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Create a route wrapper for admin routes
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && user) {
      // Check if user has admin role
      if (user.role !== 'admin' && user.email !== 'admin@example.com') {
        console.log('User does not have admin role, redirecting...');
        navigate('/products');
      }
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return <LoadingScreen message="Checking admin privileges..." />;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role === 'admin' || user.email === 'admin@example.com') {
    return children;
  }
  
  return <Navigate to="/products" />;
};

// Route wrapper for public routes
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }
  
  if (user) {
    if (user.role === 'admin' || user.email === 'admin@example.com') {
      return <Navigate to="/admin/dashboard" />;
    }
    return <Navigate to="/products" />;
  }
  return children;
};

// Root redirect component
const RootRedirect = () => {
  const { user } = useAuth();
  
  if (user) {
    if (user.role === 'admin' || user.email === 'admin@example.com') {
      return <Navigate to="/admin/dashboard" />;
    }
    return <Navigate to="/products" />;
  }
  
  return <Navigate to="/login" />;
};

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Private Routes with Main Layout */}
        <Route path="/products" element={
          <PrivateRoute>
            <MainLayout>
              <ProductList />
            </MainLayout>
          </PrivateRoute>
        } />
        
        <Route path="/products/:id" element={
          <PrivateRoute>
            <MainLayout>
              <ProductDetail />
            </MainLayout>
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </PrivateRoute>
        } />
        
        <Route path="/listings" element={
          <PrivateRoute>
            <MainLayout>
              <MyListings />
            </MainLayout>
          </PrivateRoute>
        } />
        
        <Route path="/list-item" element={
          <PrivateRoute>
            <MainLayout>
              <ProductForm />
            </MainLayout>
          </PrivateRoute>
        } />
        
        <Route path="/edit-item/:id" element={
          <PrivateRoute>
            <MainLayout>
              <ProductForm editMode={true} />
            </MainLayout>
          </PrivateRoute>
        } />
        
        <Route path="/orders" element={
          <PrivateRoute>
            <MainLayout>
              <OrderHistory />
            </MainLayout>
          </PrivateRoute>
        } />
        
        <Route path="/orders/:id" element={
          <PrivateRoute>
            <MainLayout>
              <OrderDetails />
            </MainLayout>
          </PrivateRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
        {/* Root Redirect */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* 404 - Not Found */}
        <Route path="*" element={
          <MainLayout>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                textAlign: 'center',
                p: 3
              }}
            >
              <h1>404 - Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
            </Box>
          </MainLayout>
        } />
      </Routes>
    </Suspense>
  );
}

export default App;
