import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
  Skeleton,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const MyListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch seller's products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Filter products by the current user as seller
        const response = await axios.get('/api/products', {
          params: { seller: user._id }
        });
        setProducts(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load your product listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchProducts();
    }
  }, [user]);

  // Handle menu open
  const handleMenuOpen = (event, product) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle delete dialog open
  const handleDeleteDialogOpen = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  // Handle delete product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      await axios.delete(`/api/products/${productToDelete._id}`);
      
      // Update products list after deletion
      setProducts(products.filter(p => p._id !== productToDelete._id));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Product deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete product. Please try again.',
        severity: 'error'
      });
    } finally {
      setDeleting(false);
      handleDeleteDialogClose();
    }
  };

  // Handle edit product
  const handleEditProduct = (productId) => {
    navigate(`/edit-item/${productId}`);
    handleMenuClose();
  };

  // Handle toggle availability
  const handleToggleAvailability = async (product) => {
    try {
      const response = await axios.patch(`/api/products/${product._id}`, {
        isAvailable: !product.isAvailable
      });
      
      // Update the products list with the updated product
      setProducts(products.map(p => 
        p._id === product._id ? { ...p, isAvailable: !p.isAvailable } : p
      ));
      
      // Show success message
      const status = !product.isAvailable ? 'available' : 'unavailable';
      setSnackbar({
        open: true,
        message: `Product marked as ${status}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating product availability:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update product status. Please try again.',
        severity: 'error'
      });
    }
    
    handleMenuClose();
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
      return imagePath;
    }
    if (imagePath && imagePath.startsWith('/uploads/')) {
      return `${axios.defaults.baseURL}${imagePath}`;
    }
    return imagePath;
  };

  // Check if user is a seller
  if (user?.role !== 'seller') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          You need to be registered as a seller to manage product listings.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          My Listings
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/products/new"
        >
          Add New Listing
        </Button>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={30} width="80%" />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={20} width="40%" />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" height={30} width={80} />
                  <Skeleton variant="rectangular" height={30} width={80} sx={{ ml: 1 }} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      ) : products.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8, 
          px: 2,
          bgcolor: 'background.paper',
          borderRadius: 2
        }}>
          <Typography variant="h5" gutterBottom>
            You don't have any listings yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Start selling by creating your first product listing.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/products/new"
            size="large"
            sx={{ mt: 2 }}
          >
            Create Listing
          </Button>
        </Box>
      ) : (
        <Box>
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    },
                    opacity: product.isAvailable ? 1 : 0.7
                  }}
                >
                  {/* Status indicator */}
                  {!product.isAvailable && (
                    <Chip
                      label="Unavailable"
                      color="default"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 1,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white'
                      }}
                    />
                  )}
                  
                  {/* Product image */}
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.images && product.images.length > 0 
                      ? getFullImageUrl(product.images[0])
                      : 'https://via.placeholder.com/200x200?text=No+Image'}
                    alt={product.title}
                    sx={{ objectFit: 'cover' }}
                    onClick={() => navigate(`/products/${product._id}`)}
                  />
                  
                  {/* Product info */}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" noWrap>
                      {product.title}
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ${product.price.toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      <Chip 
                        label={product.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                      <Chip 
                        label={product.condition} 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Listed on {format(new Date(product.createdAt), 'MMM d, yyyy')}
                    </Typography>
                  </CardContent>
                  
                  {/* Actions */}
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton 
                          color="primary"
                          size="small"
                          onClick={() => handleEditProduct(product._id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          color="error"
                          size="small"
                          onClick={() => handleDeleteDialogOpen(product)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={product.isAvailable}
                          onChange={() => handleToggleAvailability(product)}
                          color="primary"
                          size="small"
                        />
                      }
                      label={product.isAvailable ? "Available" : "Unavailable"}
                      sx={{ 
                        m: 0,
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.75rem'
                        } 
                      }}
                    />
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Dialog
            open={deleteDialogOpen}
            onClose={handleDeleteDialogClose}
          >
            <DialogTitle>Delete Product</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete "{productToDelete?.title}"? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteDialogClose} disabled={deleting}>
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteProduct} 
                color="error" 
                disabled={deleting}
                startIcon={deleting ? <CircularProgress size={20} /> : null}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Container>
  );
};

export default MyListings; 