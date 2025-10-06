import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Container,
  Card,
  CardContent,
  CardMedia,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ShoppingBag,
  LocalShipping,
  AttachMoney,
  Home,
  ArrowBack
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/orders/${id}`);
        setOrder(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError(
          error.response?.status === 404
            ? 'Order not found. It may have been deleted or you do not have permission to view it.'
            : 'Failed to load order details. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const getStatusChip = (status) => {
    let color, icon;
    
    switch (status) {
      case 'pending_payment':
        color = 'warning';
        icon = <AttachMoney fontSize="small" />;
        break;
      case 'pending_delivery':
        color = 'info';
        icon = <LocalShipping fontSize="small" />;
        break;
      case 'shipped':
        color = 'primary';
        icon = <LocalShipping fontSize="small" />;
        break;
      case 'delivered':
        color = 'success';
        icon = <ShoppingBag fontSize="small" />;
        break;
      case 'cancelled':
        color = 'error';
        icon = null;
        break;
      case 'returned':
        color = 'secondary';
        icon = null;
        break;
      default:
        color = 'default';
        icon = null;
    }
    
    return (
      <Chip 
        label={status.replace('_', ' ').toUpperCase()} 
        color={color} 
        size="small"
        icon={icon}
      />
    );
  };

  const getPaymentStatusChip = (status) => {
    let color;
    
    switch (status) {
      case 'paid':
        color = 'success';
        break;
      case 'pending':
        color = 'warning';
        break;
      case 'refunded':
        color = 'info';
        break;
      case 'failed':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status?.toUpperCase() || 'UNKNOWN'} 
        color={color} 
        size="small"
        variant="outlined"
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, minHeight: '50vh', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <Home sx={{ mr: 0.5, fontSize: 20 }} />
            Home
          </Link>
          <Link component={RouterLink} to="/orders" color="inherit">
            Orders
          </Link>
          <Typography color="text.primary">Order Details</Typography>
        </Breadcrumbs>
        
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          action={
            <Button component={RouterLink} to="/orders" color="inherit" size="small">
              Back to Orders
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Alert severity="info">No order information available.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <Home sx={{ mr: 0.5, fontSize: 20 }} />
          Home
        </Link>
        <Link component={RouterLink} to="/orders" color="inherit">
          Orders
        </Link>
        <Typography color="text.primary">Order #{order._id.substring(0, 8)}</Typography>
      </Breadcrumbs>
      
      <Button
        component={RouterLink}
        to="/orders"
        startIcon={<ArrowBack />}
        sx={{ mb: 3 }}
      >
        Back to Orders
      </Button>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ShoppingBag color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" component="h1">
            Order Details
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Order Information</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Order ID:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{order._id}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Date:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{format(new Date(order.createdAt), 'PPpp')}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Status:</Typography>
                </Grid>
                <Grid item xs={8}>
                  {getStatusChip(order.status)}
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Payment Status:</Typography>
                </Grid>
                <Grid item xs={8}>
                  {getPaymentStatusChip(order.paymentStatus)}
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    {order.paymentMethod?.replace('_', ' ').toUpperCase() || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, mt: 3 }}>Shipping Information</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {order.shippingAddress || 'No shipping address provided'}
              </Typography>
              
              {order.tracking && order.tracking.trackingNumber && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Tracking Number:</strong> {order.tracking.trackingNumber}
                  </Typography>
                  {order.tracking.carrier && (
                    <Typography variant="body2">
                      <strong>Carrier:</strong> {order.tracking.carrier}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Product Information</Typography>
            <Divider sx={{ mb: 2 }} />
            
            {order.product ? (
              <Card sx={{ display: 'flex', mb: 2 }}>
                <CardMedia
                  component="img"
                  sx={{ width: 100, height: 100, objectFit: 'cover' }}
                  image={order.product.images && order.product.images.length > 0 
                    ? order.product.images[0] 
                    : 'https://via.placeholder.com/100?text=No+Image'}
                  alt={order.product.title}
                />
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography component="div" variant="h6">
                    {order.product.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Price: ${order.price ? order.price.toFixed(2) : 'N/A'}
                  </Typography>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to={`/products/${order.product._id}`}
                    sx={{ mt: 1 }}
                  >
                    View Product
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Typography variant="body2">Product information not available</Typography>
            )}
            
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, mt: 3 }}>Order Summary</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1}>
                <Grid item xs={8}>
                  <Typography variant="body2">Product Price:</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">${order.price ? order.price.toFixed(2) : 'N/A'}</Typography>
                </Grid>
                
                <Grid item xs={8}>
                  <Typography variant="body2">Shipping Fee:</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">$5.00</Typography>
                </Grid>
                
                <Grid item xs={8}>
                  <Typography variant="body2">Tax (8%):</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">
                    ${order.price ? (order.price * 0.08).toFixed(2) : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={8}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 1 }}>Total:</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 1 }}>
                    ${order.total ? order.total.toFixed(2) : 
                       (order.price ? (order.price + 5 + (order.price * 0.08)).toFixed(2) : 'N/A')}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Seller Information</Typography>
        <Divider sx={{ mb: 2 }} />
        
        {order.seller ? (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Name:</strong> {order.seller.name}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {order.seller.email}
              </Typography>
              {order.seller.phone && (
                <Typography variant="body2">
                  <strong>Phone:</strong> {order.seller.phone}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              {/* Contact functionality removed - messaging disabled */}
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2">Seller information unavailable</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default OrderDetails; 