import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Collapse,
  Divider,
  Grid,
  Link,
  TablePagination
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Visibility,
  ShoppingBag,
  AttachMoney,
  LocalShipping
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/orders/myorders');
        setOrders(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load your order history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExpandOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

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
        label={status.toUpperCase()} 
        color={color} 
        size="small"
        variant="outlined"
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  if (orders.length === 0) {
    return (
      <Box sx={{ my: 2 }}>
        <Alert severity="info">
          You don't have any orders yet. Start shopping to see your order history here!
        </Alert>
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', mt: 2 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <ShoppingBag color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2" fontWeight="bold">
          Order History
        </Typography>
      </Box>
      <Divider />
      <TableContainer>
        <Table aria-label="order history table">
          <TableHead>
            <TableRow>
              <TableCell>Order Date</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => (
                <React.Fragment key={order._id}>
                  <TableRow 
                    hover 
                    sx={{ 
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                      cursor: 'pointer'
                    }}
                    onClick={() => handleExpandOrder(order._id)}
                  >
                    <TableCell>
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {order.product ? order.product.title : 'Unavailable Product'}
                    </TableCell>
                    <TableCell>
                      {order.price ? `$${order.price.toFixed(2)}` : 'N/A'}
                    </TableCell>
                    <TableCell>{getStatusChip(order.status)}</TableCell>
                    <TableCell>{getPaymentStatusChip(order.paymentStatus)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExpandOrder(order._id);
                        }}
                      >
                        {expandedOrder === order._id ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                      {order.product && (
                        <IconButton
                          size="small"
                          component={RouterLink}
                          to={`/products/${order.product._id}`}
                          onClick={(e) => e.stopPropagation()}
                          aria-label="View Product"
                        >
                          <Visibility />
                        </IconButton>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        component={RouterLink}
                        to={`/orders/${order._id}`}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ ml: 1 }}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                      <Collapse in={expandedOrder === order._id} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                Order Details
                              </Typography>
                              <Typography variant="body2">
                                <strong>Order ID:</strong> {order._id}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Date:</strong> {format(new Date(order.createdAt), 'PPpp')}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Payment Method:</strong> {order.paymentMethod.replace('_', ' ').toUpperCase()}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Total Amount:</strong> ${order.total ? order.total.toFixed(2) : (order.price + 5 + (order.price * 0.08)).toFixed(2)}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                Shipping Details
                              </Typography>
                              <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                                {order.shippingAddress}
                              </Typography>
                              {order.tracking && order.tracking.trackingNumber && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  <strong>Tracking:</strong> {order.tracking.trackingNumber}
                                </Typography>
                              )}
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                Seller Information
                              </Typography>
                              {order.seller ? (
                                <>
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
                                </>
                              ) : (
                                <Typography variant="body2">Seller information unavailable</Typography>
                              )}
                            </Grid>
                          </Grid>
                          
                          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            {order.product && (
                              <Button 
                                variant="contained" 
                                size="small"
                                component={RouterLink}
                                to={`/products/${order.product._id}`}
                              >
                                View Product
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default OrderHistory; 