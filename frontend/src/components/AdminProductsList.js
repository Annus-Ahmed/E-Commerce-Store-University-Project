import React, { useState, useEffect, useCallback } from 'react';
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
  Avatar,
  IconButton,
  InputAdornment,
  Tooltip,
  Alert
} from '@mui/material';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminProductsList = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Ensure token is set in headers for each request
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      let url = `/api/admin/products?page=${page + 1}&limit=${rowsPerPage}`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      if (statusFilter) {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setProducts(response.data.products);
      setTotalProducts(response.data.total);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      
      if (err.response && err.response.status === 401) {
        setError('Authentication error. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(`Error: ${err.message || 'Failed to load products'}`);
      }
      
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter, navigate]);

  // Check authentication and admin role
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      setError('Authentication required. Please log in.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    if (userRole !== 'admin') {
      setError('Admin access required for this page.');
      setTimeout(() => navigate('/'), 2000);
      return;
    }
    
    // Set the authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Initial data fetch
    fetchProducts();
  }, [navigate, fetchProducts]);
  
  // Update products when page or rows per page changes
  useEffect(() => {
    if (!error) { // Only fetch if no auth errors
      fetchProducts();
    }
  }, [fetchProducts, error]);

  // Effect for status filter changes
  useEffect(() => {
    if (!error) { // Only change if no auth errors
      setPage(0); // Reset to first page when filter changes
      fetchProducts();
    }
  }, [statusFilter, fetchProducts, error]);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleSearch = useCallback(() => {
    if (error && error.includes('Authentication')) return;
    
    setSearchLoading(true);
    setPage(0);
    fetchProducts();
  }, [fetchProducts, error]);
  
  const clearSearch = useCallback(() => {
    if (error && error.includes('Authentication')) return;
    
    setSearch('');
    if (search) {
      setPage(0);
      setSearchLoading(true);
      setTimeout(() => fetchProducts(), 0);
    }
  }, [search, fetchProducts, error]);

  const handleOpenStatusDialog = useCallback((product) => {
    setSelectedProduct(product);
    setNewStatus(product.status);
    setOpenStatusDialog(true);
  }, []);

  const handleCloseStatusDialog = useCallback(() => {
    setOpenStatusDialog(false);
    setSelectedProduct(null);
  }, []);

  const handleStatusChange = useCallback(async () => {
    if (!selectedProduct) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      await axios.patch(`/api/admin/products/status`, {
        productId: selectedProduct._id,
        status: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update product in the list
      setProducts(products.map(product => 
        product._id === selectedProduct._id 
          ? { ...product, status: newStatus } 
          : product
      ));
      
      handleCloseStatusDialog();
      // Fetch updated product list to ensure consistency
      fetchProducts();
      setError(null);
    } catch (err) {
      console.error('Error updating product status:', err);
      
      if (err.response && err.response.status === 401) {
        setError('Authentication error. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(`Error: ${err.response?.data?.message || 'Failed to update product status'}`);
        alert(`Error updating status: ${err.response?.data?.message || 'Unknown error'}`);
      }
    } finally {
      setActionLoading(false);
    }
  }, [selectedProduct, newStatus, products, navigate, fetchProducts, handleCloseStatusDialog]);

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'removed':
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

  const handleOpenDetailModal = useCallback((product) => {
    setSelectedProduct(product);
    setOpenDetailModal(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setOpenDetailModal(false);
    setSelectedProduct(null);
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Product Management
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', mb: 3, gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        <TextField
          label="Search by title or seller name"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label="clear search"
                  onClick={clearSearch}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={searchLoading}
          startIcon={searchLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
        >
          {searchLoading ? 'Searching...' : 'Search'}
        </Button>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
            startAdornment={<FilterAltIcon sx={{ ml: -0.5, mr: 0.5, color: 'primary.main' }} />}
          >
            <MenuItem value="">
              <em>All Status</em>
            </MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="removed">Removed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Status filter chip display */}
      {(statusFilter || search) && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {statusFilter && (
            <Chip
              label={`Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
              onDelete={() => setStatusFilter('')}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
          {search && (
            <Chip
              label={`Search: ${search}`}
              onDelete={clearSearch}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
          {(statusFilter || search) && (
            <Chip
              label="Clear All Filters"
              onClick={() => {
                setStatusFilter('');
                setSearch('');
                setPage(0);
                setTimeout(() => fetchProducts(), 0);
              }}
              color="secondary"
              size="small"
            />
          )}
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Seller</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Listed Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  {search || statusFilter ? 
                    'No products found matching your criteria' : 
                    'No products found'}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {product.images && product.images.length > 0 ? (
                        <Avatar 
                          src={product.images[0]} 
                          alt={product.title} 
                          variant="rounded"
                          sx={{ mr: 2, width: 50, height: 50 }}
                        />
                      ) : (
                        <Avatar 
                          variant="rounded"
                          sx={{ mr: 2, width: 50, height: 50, bgcolor: 'grey.300' }}
                        >
                          No Img
                        </Avatar>
                      )}
                      <Typography variant="body2">{product.title}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    {product.seller ? `${product.seller.name}` : 'Unknown Seller'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.status.charAt(0).toUpperCase() + product.status.slice(1)} 
                      color={getStatusChipColor(product.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(product.createdAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDetailModal(product)}
                          color="primary"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenStatusDialog(product)}
                      >
                        Change Status
                      </Button>
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
          count={totalProducts}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Change Status Dialog */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
        <DialogTitle>Change Product Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Change the status for product: {selectedProduct?.title}
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="change-status-label">Status</InputLabel>
            <Select
              labelId="change-status-label"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="removed">Removed</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Note: 'Inactive' and 'Removed' both hide the product from buyers, but 'Removed' indicates the product violates policies.
            </Typography>
          </Box>
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

      {/* Product Detail Modal */}
      <Dialog open={openDetailModal} onClose={handleCloseDetailModal} maxWidth="sm" fullWidth>
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent dividers>
          {selectedProduct ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <Avatar 
                    src={selectedProduct.images[0]} 
                    alt={selectedProduct.title} 
                    variant="rounded"
                    sx={{ width: 80, height: 80, mr: 2 }}
                  />
                ) : (
                  <Avatar variant="rounded" sx={{ width: 80, height: 80, mr: 2, bgcolor: 'grey.300' }}>No Img</Avatar>
                )}
                <Box>
                  <Typography variant="h6" fontWeight="bold">{selectedProduct.title}</Typography>
                  <Typography variant="subtitle1" color="primary">{formatPrice(selectedProduct.price)}</Typography>
                  <Typography variant="body2" color="textSecondary">{selectedProduct.category}</Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ mb: 2 }}><strong>Description:</strong> {selectedProduct.description}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Seller:</strong> {selectedProduct.seller ? selectedProduct.seller.name : 'Unknown Seller'}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Status:</strong> 
                <Chip 
                  label={selectedProduct.status.charAt(0).toUpperCase() + selectedProduct.status.slice(1)}
                  color={getStatusChipColor(selectedProduct.status)}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Listed Date:</strong> {formatDate(selectedProduct.createdAt)}</Typography>
              {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                <Box sx={{ mt: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Tags:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                    {selectedProduct.tags.map((tag, idx) => (
                      <Chip key={idx} label={tag} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Typography>No product selected.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailModal} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProductsList; 