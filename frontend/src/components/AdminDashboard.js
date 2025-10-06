import React, { useState, useEffect } from 'react';
import { Box, Container, Tab, Tabs, Typography, Paper, Grid, Card, CardContent, CircularProgress, AppBar, Toolbar, Button, IconButton, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminUsersList from './AdminUsersList';
import AdminProductsList from './AdminProductsList';
import AdminReportsList from './AdminReportsList';
import AdminOrdersList from './AdminOrdersList';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReportIcon from '@mui/icons-material/Report';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LogoutIcon from '@mui/icons-material/Logout';
import StoreIcon from '@mui/icons-material/Store';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

// Simple Admin Navbar Component
const AdminNavbar = ({ onLogout }) => {
  return (
    <AppBar position="fixed" color="primary">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          sx={{ mr: 2 }}
        >
          <StoreIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Pre-Owned Admin Dashboard
        </Typography>
        <Button 
          color="inherit" 
          onClick={onLogout}
          startIcon={<LogoutIcon />}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

// Default stats when API fails
const defaultStats = {
  users: { total: 0, sellers: 0, buyers: 0 },
  products: { total: 0, active: 0 },
  reports: { total: 0, pending: 0 },
  orders: { total: 0, pending: 0, completed: 0 }
};

const AdminDashboard = () => {
  const [value, setValue] = useState(0);
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AdminDashboard mounted - current user:", user);
    
    // Check if we have authentication
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole');
    
    if (!token) {
      console.log("No authentication token found, redirecting to login...");
      navigate('/login');
      return;
    }
    
    // Check if user is admin or admin@example.com
    if (storedRole !== 'admin' && (!user || (user && user.role !== 'admin' && user.email !== 'admin@example.com'))) {
      console.log("User is not admin, redirecting...");
      navigate('/products');
      return;
    }
    
    // Set up the authentication header every time to be sure
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        console.log("Fetching admin dashboard stats...");
        
        const response = await axios.get('/api/admin/dashboard');
        console.log("Dashboard stats received:", response.data);
        setStats(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError(`Failed to load dashboard data: ${error.response?.data?.message || error.message}`);
        
        // Try to initialize models if stats are not available
        try {
          // Make a call to create initial empty collections
          await axios.get('/api/admin/users');
          console.log('Made first admin users call to initialize collections');
        } catch (initError) {
          console.log('Initialization call completed');
        }
        
        // Use default stats as fallback
        setStats(defaultStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleLogout = () => {
    console.log("Logging out from admin dashboard");
    logout();
    navigate('/login');
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading admin dashboard...</Typography>
      </Box>
    );
  }

  return (
    <>
      <AdminNavbar onLogout={handleLogout} />
      <Toolbar /> {/* Empty toolbar to push content below app bar */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ p: 3, mb: 4, borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            Admin Dashboard
          </Typography>
          
          <Tabs 
            value={value} 
            onChange={handleChange} 
            aria-label="admin tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" {...a11yProps(0)} />
            <Tab icon={<PersonIcon />} iconPosition="start" label="Users" {...a11yProps(1)} />
            <Tab icon={<ShoppingCartIcon />} iconPosition="start" label="Products" {...a11yProps(2)} />
            <Tab icon={<ReportIcon />} iconPosition="start" label="Reports" {...a11yProps(3)} />
            <Tab icon={<LocalShippingIcon />} iconPosition="start" label="Orders" {...a11yProps(4)} />
          </Tabs>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4" component="div">
                  {stats?.users?.total || 0}
                </Typography>
                <Typography variant="body2">
                  Buyers: {stats?.users?.buyers || 0} | Sellers: {stats?.users?.sellers || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Products
                </Typography>
                <Typography variant="h4" component="div">
                  {stats?.products?.total || 0}
                </Typography>
                <Typography variant="body2">
                  Active: {stats?.products?.active || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Reports
                </Typography>
                <Typography variant="h4" component="div">
                  {stats?.reports?.total || 0}
                </Typography>
                <Typography variant="body2">
                  Pending: {stats?.reports?.pending || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Orders
                </Typography>
                <Typography variant="h4" component="div">
                  {stats?.orders?.total || 0}
                </Typography>
                <Typography variant="body2">
                  Pending: {stats?.orders?.pending || 0} | Completed: {stats?.orders?.completed || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TabPanel value={value} index={0}>
          <Typography variant="h5" gutterBottom>Dashboard Overview</Typography>
          <Typography variant="body1">
            Welcome to the admin dashboard. You can manage users, products, reports, and orders from here.
          </Typography>
          {error && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Some data might not be available due to API errors. Basic functionality should still work.
            </Alert>
          )}
        </TabPanel>
        
        <TabPanel value={value} index={1}>
          <AdminUsersList />
        </TabPanel>
        
        <TabPanel value={value} index={2}>
          <AdminProductsList />
        </TabPanel>
        
        <TabPanel value={value} index={3}>
          <AdminReportsList />
        </TabPanel>
        
        <TabPanel value={value} index={4}>
          <AdminOrdersList />
        </TabPanel>
      </Container>
    </>
  );
};

export default AdminDashboard; 