import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Chip,
  IconButton,
  Avatar
} from '@mui/material';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

const AdminOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [openProductDetailModal, setOpenProductDetailModal] = useState(false);
  const [productDetail, setProductDetail] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Use the admin-specific endpoint
      const response = await axios.get('/api/admin/orders', {
        params: {
          page: page + 1,  // MUI pagination is 0-based, API is 1-based
          limit: rowsPerPage,
          status: statusFilter || undefined
        }
      });
      
      // The API now returns paginated data
      setOrders(response.data.orders || []);
      setTotalOrders(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, statusFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = () => {
    setPage(0);
    fetchOrders();
  };

  const handleOpenStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSelectedOrder(null);
  };

  const handleOpenPaymentDialog = (order) => {
    setSelectedOrder(order);
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = async () => {
    if (!selectedOrder) return;
    
    setActionLoading(true);
    try {
      await axios.patch(`/api/admin/orders/status`, {
        orderId: selectedOrder._id,
        status: newStatus
      });
      
      // Refresh the orders list
      await fetchOrders();
      handleCloseStatusDialog();
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedOrder) return;
    
    setActionLoading(true);
    try {
      await axios.patch(`/api/admin/orders/status`, {
        orderId: selectedOrder._id,
        paymentStatus: 'paid'
      });
      
      // Refresh the orders list
      await fetchOrders();
      handleClosePaymentDialog();
    } catch (error) {
      console.error('Error confirming payment:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'pending_payment':
        return 'warning';
      case 'pending_delivery':
        return 'secondary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusChipColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatStatusLabel = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleOpenProductDetailModal = async (order) => {
    if (order.product && order.product._id) {
      try {
        const response = await axios.get(`/api/products/${order.product._id}`);
        setProductDetail(response.data);
        setOpenProductDetailModal(true);
      } catch (error) {
        setProductDetail(null);
        setOpenProductDetailModal(false);
      }
    }
  };

  const handleCloseProductDetailModal = () => {
    setOpenProductDetailModal(false);
    setProductDetail(null);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Order Management
      </Typography>
      
      <Box sx={{ display: 'flex', mb: 3, gap: 2 }}>
        <TextField
          label="Search by product or buyer"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          startIcon={<SearchIcon />}
        >
          Search
        </Button>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="pending_payment">Pending Payment</MenuItem>
            <MenuItem value="pending_delivery">Pending Delivery</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Buyer</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Order Status</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {order._id.substring(order._id.length - 8).toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.product?.title || 'Unknown Product'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatPrice(order.price)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.buyer?.name || 'Unknown Buyer'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2">
                        {order.paymentMethod?.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Chip 
                        label={order.paymentStatus} 
                        color={getPaymentStatusChipColor(order.paymentStatus)}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={formatStatusLabel(order.status)} 
                      color={getStatusChipColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        title="View Order Details"
                        color="primary"
                        onClick={() => handleOpenProductDetailModal(order)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Change Order Status"
                        color="secondary"
                        onClick={() => handleOpenStatusDialog(order)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      {order.paymentStatus === 'pending' && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenPaymentDialog(order)}
                        >
                          Confirm Payment
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalOrders}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Change Status Dialog */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
        <DialogTitle>Change Order Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Update the status for order {selectedOrder?._id?.substring(selectedOrder?._id?.length - 8).toUpperCase()}
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="change-status-label">Status</InputLabel>
            <Select
              labelId="change-status-label"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="pending_payment">Pending Payment</MenuItem>
              <MenuItem value="pending_delivery">Pending Delivery</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog} disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleStatusChange} 
            variant="contained" 
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={handleClosePaymentDialog}>
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this order as paid? This action is for bank transfers and COD orders.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog} disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmPayment} 
            variant="contained" 
            color="success"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Confirm Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Detail Modal for Ordered Items */}
      <Dialog open={openProductDetailModal} onClose={handleCloseProductDetailModal} maxWidth="sm" fullWidth>
        <DialogTitle>Ordered Product Details</DialogTitle>
        <DialogContent dividers>
          {productDetail ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {productDetail.images && productDetail.images.length > 0 ? (
                  <Avatar 
                    src={productDetail.images[0]} 
                    alt={productDetail.title} 
                    variant="rounded"
                    sx={{ width: 80, height: 80, mr: 2 }}
                  />
                ) : (
                  <Avatar variant="rounded" sx={{ width: 80, height: 80, mr: 2, bgcolor: 'grey.300' }}>No Img</Avatar>
                )}
                <Box>
                  <Typography variant="h6" fontWeight="bold">{productDetail.title}</Typography>
                  <Typography variant="subtitle1" color="primary">{productDetail.price ? `$${productDetail.price}` : ''}</Typography>
                  <Typography variant="body2" color="textSecondary">{productDetail.category}</Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ mb: 2 }}><strong>Description:</strong> {productDetail.description}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Seller:</strong> {productDetail.seller ? productDetail.seller.name : 'Unknown Seller'}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Status:</strong> {productDetail.status}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Listed Date:</strong> {productDetail.createdAt ? new Date(productDetail.createdAt).toLocaleDateString() : ''}</Typography>
              {productDetail.tags && productDetail.tags.length > 0 && (
                <Box sx={{ mt: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Tags:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                    {productDetail.tags.map((tag, idx) => (
                      <Chip key={idx} label={tag} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Typography>No product details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDetailModal} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrdersList; 