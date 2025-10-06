import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  Avatar,
  Skeleton,
  Alert,
  useTheme,
  ImageList,
  ImageListItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Modal,
  TextField,
  Snackbar,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Tooltip,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Backdrop
} from '@mui/material';
import { 
  ArrowBack, 
  Person, 
  LocationOn, 
  Edit, 
  Delete, 
  Phone,
  AccessTime,
  Email,
  Close,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Share,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Message,
  Report,
  Storage,
  Info,
  LocalShipping,
  Payment,
  CreditCard,
  MoneyOff,
  AttachMoney,
  CreditScore,
  AccountBalance,
  ExpandMore,
  CheckCircle
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import ReviewSection from './ReviewSection';
import ReportButton from './ReportButton';

// Add this helper function before the ProductDetail component
const getFullImageUrl = (imagePath) => {
  // Check if the image path is already a full URL
  if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }
  
  // If it's a relative path from the backend, prepend the base URL
  if (imagePath && imagePath.startsWith('/uploads/')) {
    return `${axios.defaults.baseURL}${imagePath}`;
  }
  
  // Return the original path if it doesn't match known patterns
  return imagePath;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  
  // Product data
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Image gallery
  const [selectedImage, setSelectedImage] = useState(0);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  
  // Contact options
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [contactMethod, setContactMethod] = useState('email');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Related products
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  
  // Wishlist
  const [inWishlist, setInWishlist] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState(0);

  // Payment options
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [activeStep, setActiveStep] = useState(0);
  const [orderComplete, setOrderComplete] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // New state for message dialog
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // New state for image dialog
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [inWishlistChecked, setInWishlistChecked] = useState(false);

  // Add new state for confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch product details when component mounts or ID changes
  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  // Separate useEffect to check wishlist status if user changes
  useEffect(() => {
    if (user && product) {
      checkWishlistStatus();
    }
  }, [user, product?._id]);

  // Function to check if product is in user's wishlist
  const checkWishlistStatus = async () => {
    if (!user) return;
    
    try {
      const wishlistResponse = await axios.get(`/api/users/wishlist`);
      const isInWishlist = wishlistResponse.data.some(item => 
        item._id === id || (typeof item === 'string' && item === id)
      );
      setInWishlist(isInWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      
      // Process the product data to ensure image URLs are complete
      const processedProduct = {
        ...response.data,
        images: response.data.images.map(image => getFullImageUrl(image))
      };
      
      setProduct(processedProduct);
      
      // Set the first image as selected by default if images exist
      if (processedProduct.images && processedProduct.images.length > 0) {
        setSelectedImage(0);
      }
      
      // Fetch related products
      try {
        setLoadingRelated(true);
        const relatedResponse = await axios.get(`/api/products/similar/${id}`);
        
        // Process related products to ensure image URLs are complete
        const processedRelated = relatedResponse.data.map(product => ({
          ...product,
          images: product.images.map(image => getFullImageUrl(image))
        }));
        
        setRelatedProducts(processedRelated.slice(0, 4)); // Limit to 4 related products
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoadingRelated(false);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError('Failed to load product details. Please try again later.');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  // New function to handle delete button click
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  // Close the delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // Handle the actual deletion
  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/products/${id}`);
      // Show success message before navigating
      setSnackbarMessage('Product listing deleted successfully');
      setSnackbarOpen(true);
      // Close dialog
      setDeleteDialogOpen(false);
      // Navigate after a slight delay to show the message
      setTimeout(() => {
        navigate('/products');
      }, 1500);
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbarMessage('Failed to delete product: ' + (error.response?.data?.message || error.message));
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Image gallery handlers
  const handlePrevImage = () => {
    if (product.images && product.images.length > 0) {
      setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    if (product.images && product.images.length > 0) {
      setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    }
  };

  const handleOpenImageDialog = () => {
    setOpenImageDialog(true);
  };

  const handleCloseImageDialog = () => {
    setOpenImageDialog(false);
  };

  // Contact dialog handlers
  const handleOpenContactDialog = () => {
    setContactDialogOpen(true);
  };

  const handleCloseContactDialog = () => {
    setContactDialogOpen(false);
    setMessageText('');
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      // Different logic based on contact method
      if (contactMethod === 'email') {
        // Send email - in a real app, you'd use your backend to handle this
        window.location.href = `mailto:${product.seller?.email}?subject=Regarding your listing: ${product.title}&body=${encodeURIComponent(messageText)}`;
        setSnackbarMessage('Email client opened');
      } else if (contactMethod === 'phone') {
        // Open phone dialer
        window.location.href = `tel:${product.seller?.phone}`;
        setSnackbarMessage('Phone dialer opened');
      }

      setSnackbarOpen(true);
      handleCloseContactDialog();
    } catch (error) {
      console.error('Error sending message:', error);
      setSnackbarMessage('Failed to send message. Please try again.');
      setSnackbarOpen(true);
    }
  };

  // Wishlist handlers
  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (inWishlist) {
        // Remove from wishlist
        await axios.delete(`/api/users/wishlist/${id}`);
        setSnackbarMessage('Removed from wishlist');
      } else {
        // Add to wishlist
        await axios.post(`/api/users/wishlist/${id}`);
        setSnackbarMessage('Added to wishlist');
      }
      
      // Update the wishlist state locally instead of fetching again
      setInWishlist(!inWishlist);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating wishlist:', error);
      setSnackbarMessage('Failed to update wishlist. Please try again.');
      setSnackbarOpen(true);
    }
  };

  // Checkout dialog handlers
  const handleOpenCheckoutDialog = () => {
    setCheckoutDialogOpen(true);
    setActiveStep(0);
    setOrderComplete(false);
  };

  const handleCloseCheckoutDialog = () => {
    setCheckoutDialogOpen(false);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true); // Add loading state
      setSnackbarMessage('Processing your order...');
      setSnackbarOpen(true);
      
      // Validate shipping address for COD
      if (paymentMethod === 'cod' && !shippingAddress?.trim()) {
        setSnackbarMessage('Please enter a valid delivery address for Cash on Delivery');
        setSnackbarOpen(true);
        setPlacingOrder(false);
        return;
      }
      
      // Get user address from profile or use default text if not available
      const userDefaultAddress = user?.address ? 
        `${user.address.street || ''}, ${user.address.city || ''}, ${user.address.state || ''} ${user.address.zipCode || ''}`.trim() : 
        'Address not provided';
      
      // Use delivery address based on payment method
      let deliveryAddress = shippingAddress?.trim();
      
      // If address is empty, use user's default address
      if (!deliveryAddress) {
        deliveryAddress = userDefaultAddress;
      }
      
      // For credit card payments, if no address provided, use a placeholder
      if (paymentMethod === 'credit_card' && !deliveryAddress) {
        deliveryAddress = 'Digital purchase - no shipping required';
      }
      
      // Ensure we have some address for all payment methods
      if (!deliveryAddress) {
        deliveryAddress = 'Address to be confirmed';
      }
      
      // Prepare order data
      const orderData = {
        productId: product._id,
        paymentMethod,
        shippingAddress: deliveryAddress,
        paymentDetails: paymentMethod === 'credit_card' ? cardDetails : {}
      };
      
      // Send to backend API
      const response = await axios.post('/api/orders', orderData);
      
      // Order completed
      setActiveStep(2);
      setOrderComplete(true);
      setSnackbarMessage(`Order placed successfully with ${getPaymentMethodLabel(paymentMethod)}`);
      setSnackbarOpen(true);
      
      // After a successful order, update the product availability locally too
      setProduct({
        ...product,
        isAvailable: false
      });
      
      // Order placed successfully
      const message = `Order placed successfully ${paymentMethod === 'cod' ? 'with Cash on Delivery' : 
        paymentMethod === 'bank_transfer' ? 'via Bank Transfer' : 
        'with Credit Card'
      }. Order #${response.data._id}`;
      
    } catch (error) {
      console.error('Error placing order:', error);
      setSnackbarMessage(
        error.response?.data?.message || 
        'Failed to place order. Please try again.'
      );
      setSnackbarOpen(true);
    } finally {
      setPlacingOrder(false);
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'cod':
        return 'Cash on Delivery';
      case 'bank_transfer':
        return 'Bank Transfer';
      default:
        return 'Unknown Method';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard />;
      case 'cod':
        return <MoneyOff />;
      case 'bank_transfer':
        return <AccountBalance />;
      default:
        return <Payment />;
    }
  };

  // Updated Buy Now handler
  const handleBuyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    handleOpenCheckoutDialog();
  };

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ width: '100%' }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={400} 
                sx={{ borderRadius: '16px' }} 
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                {[1, 2, 3].map((item) => (
                  <Skeleton 
                    key={item}
                    variant="rectangular" 
                    width={80} 
                    height={80} 
                    sx={{ borderRadius: '8px' }} 
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" height={60} width="80%" />
              <Skeleton variant="text" height={30} width="40%" sx={{ mt: 2 }} />
              <Skeleton variant="text" height={24} width="60%" sx={{ mt: 2 }} />
              <Skeleton variant="text" height={24} width="70%" sx={{ mt: 1 }} />
              <Skeleton variant="text" height={24} width="50%" sx={{ mt: 1 }} />
              <Box sx={{ mt: 4 }}>
                <Skeleton variant="rectangular" height={50} width="60%" sx={{ borderRadius: '8px' }} />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          component={Link}
          to="/products"
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Product not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          component={Link}
          to="/products"
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  const isOwner = user && product.seller && user._id === product.seller._id;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {loading ? (
        <Box sx={{ width: '100%' }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={400} 
                sx={{ borderRadius: '16px' }} 
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                {[1, 2, 3].map((item) => (
                  <Skeleton 
                    key={item}
                    variant="rectangular" 
                    width={80} 
                    height={80} 
                    sx={{ borderRadius: '8px' }} 
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" height={60} width="80%" />
              <Skeleton variant="text" height={30} width="40%" sx={{ mt: 2 }} />
              <Skeleton variant="text" height={24} width="60%" sx={{ mt: 2 }} />
              <Skeleton variant="text" height={24} width="70%" sx={{ mt: 1 }} />
              <Skeleton variant="text" height={24} width="50%" sx={{ mt: 1 }} />
              <Box sx={{ mt: 4 }}>
                <Skeleton variant="rectangular" height={50} width="60%" sx={{ borderRadius: '8px' }} />
              </Box>
            </Grid>
          </Grid>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      ) : product ? (
        <>
          <Button
            component={Link}
            to="/products"
            startIcon={<ArrowBack />}
            sx={{ mb: 4, transition: 'transform 0.2s', '&:hover': { transform: 'translateX(-4px)' } }}
          >
            Back to Products
          </Button>
          
          <Grid container spacing={4}>
            {/* Product Images */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Paper 
                  elevation={2} 
                  sx={{ 
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    position: 'relative',
                    aspectRatio: '4/3',
                    mb: 2
                  }}
                >
                  {product.images && product.images.length > 0 ? (
                    <Box
                      component="img"
                      src={product.images[selectedImage]}
                      alt={product.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                      onClick={handleOpenImageDialog}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100'
                      }}
                    >
                      <Typography variant="body1" color="textSecondary">
                        No image available
                      </Typography>
                    </Box>
                  )}
                  
                  {product.images && product.images.length > 1 && (
                    <>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          left: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.8)',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                        }}
                        onClick={handlePrevImage}
                      >
                        <ChevronLeft />
                      </IconButton>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.8)',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                        }}
                        onClick={handleNextImage}
                      >
                        <ChevronRight />
                      </IconButton>
                    </>
                  )}
                </Paper>
                
                {/* Thumbnail Gallery */}
                {product.images && product.images.length > 1 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {product.images.map((image, index) => (
                      <Box
                        key={index}
                        component={motion.div}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: index === selectedImage ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedImage(index)}
                      >
                        <Box
                          component="img"
                          src={image}
                          alt={`${product.title} - view ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </motion.div>
            </Grid>
            
            {/* Product Details */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {product.title}
                </Typography>
                
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', my: 2 }}>
                  {product.formattedPrice || `$${product.price.toFixed(2)}`}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  <Chip 
                    label={product.category} 
                    color="primary" 
                    variant="outlined" 
                    sx={{ textTransform: 'capitalize' }} 
                  />
                  <Chip 
                    label={product.condition} 
                    color="secondary" 
                    variant="outlined" 
                    sx={{ textTransform: 'capitalize' }} 
                  />
                  {product.tags && product.tags.map((tag, index) => (
                    <Chip key={index} label={tag} variant="outlined" size="small" />
                  ))}
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {product.description}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Condition
                      </Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {product.condition}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Location
                      </Typography>
                      <Typography variant="body1">
                        {product.location || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Posted On
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(product.createdAt)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                  {isOwner ? (
                    // Show these options ONLY if the current user is the OWNER of this product
                    <>
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Product Owner Actions
                        </Typography>
                      </Box>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          startIcon={<Edit />}
                          component={Link}
                          to={`/edit-item/${product._id}`}
                          sx={{ 
                            px: 4, 
                            py: 1.5, 
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)'
                          }}
                        >
                          Edit Detail
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          size="large"
                          startIcon={<Delete />}
                          onClick={handleDeleteClick}
                          sx={{ 
                            px: 4, 
                            py: 1.5, 
                            borderRadius: '8px',
                            fontWeight: 'bold'
                          }}
                        >
                          Delete Product
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="text"
                          color={product.isAvailable ? 'success' : 'warning'}
                          size="large"
                          onClick={() => {
                            axios.patch(`/api/products/${product._id}`, {
                              isAvailable: !product.isAvailable
                            }).then(() => {
                              setProduct({...product, isAvailable: !product.isAvailable});
                              setSnackbarMessage(`Product marked as ${!product.isAvailable ? 'available' : 'unavailable'}`);
                              setSnackbarOpen(true);
                            }).catch(err => {
                              console.error('Error updating product:', err);
                              setSnackbarMessage('Failed to update product status');
                              setSnackbarOpen(true);
                            });
                          }}
                        >
                          Mark as {product.isAvailable ? 'Unavailable' : 'Available'}
                        </Button>
                      </motion.div>
                    </>
                  ) : (
                    // For ALL OTHER USERS (buyers and non-owner sellers)
                    <>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          startIcon={<ShoppingCart />}
                          onClick={handleBuyNow}
                          disabled={!product.isAvailable || product.status !== 'active'}
                          sx={{ 
                            px: 4, 
                            py: 1.5, 
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)'
                          }}
                        >
                          {product.isAvailable && product.status === 'active' ? 'Buy Now' : 'Sold Out'}
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="large"
                          startIcon={<Message />}
                          onClick={handleOpenContactDialog}
                          sx={{ 
                            px: 4, 
                            py: 1.5, 
                            borderRadius: '8px',
                            fontWeight: 'bold'
                          }}
                        >
                          Contact Seller
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="text"
                          color="primary"
                          startIcon={inWishlist ? <Favorite color="secondary" /> : <FavoriteBorder />}
                          onClick={handleToggleWishlist}
                          sx={{ fontWeight: 'bold' }}
                        >
                          {inWishlist ? 'Saved' : 'Save'}
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <ReportButton
                          targetId={product._id}
                          targetType="product"
                          buttonText="Report Listing"
                          color="error"
                        />
                      </motion.div>
                    </>
                  )}
                </Box>
              </motion.div>
            </Grid>
          </Grid>
          
          {/* Seller Information */}
          <Box mt={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  About the Seller
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    src={product.seller?.profileImage} 
                    sx={{ 
                      width: 60, 
                      height: 60,
                      bgcolor: theme.palette.primary.main
                    }}
                  >
                    {product.seller?.name?.charAt(0) || <Person />}
                  </Avatar>
                  
                  <Box>
                    <Typography variant="h6">
                      {product.seller?.name || 'Anonymous'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Member since {(() => {
                        const date = product.seller?.joinedDate || product.seller?.createdAt;
                        if (!date) return 'N/A';
                        const formatted = formatDate(date);
                        return formatted === 'Invalid Date' ? 'N/A' : formatted;
                      })()}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Box>
        </>
      ) : null}
      
      {/* Image dialog and other dialogs as they were */}
      <Dialog
        open={openImageDialog}
        onClose={handleCloseImageDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative', bgcolor: 'black' }}>
          <IconButton
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
            onClick={handleCloseImageDialog}
          >
            <Close />
          </IconButton>
          
          {product.images && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh',
                width: '100%',
                position: 'relative'
              }}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
              
              {product.images.length > 1 && (
                <>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      left: 20,
                      color: 'white',
                      bgcolor: 'rgba(0,0,0,0.5)',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                    }}
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft fontSize="large" />
                  </IconButton>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      right: 20,
                      color: 'white',
                      bgcolor: 'rgba(0,0,0,0.5)',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                    }}
                    onClick={handleNextImage}
                  >
                    <ChevronRight fontSize="large" />
                  </IconButton>
                  
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 20,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 1
                    }}
                  >
                    {product.images.map((_, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: selectedImage === index ? 'white' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedImage(index)}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Contact seller dialog */}
      <Dialog 
        open={contactDialogOpen} 
        onClose={handleCloseContactDialog}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ position: 'relative', p: 3 }}>
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={handleCloseContactDialog}
          >
            <Close />
          </IconButton>
          
          <Typography variant="h5" gutterBottom>
            Contact Seller
          </Typography>
          
          <Tabs 
            value={contactMethod} 
            onChange={(e, newValue) => setContactMethod(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab value="email" label="Email" icon={<Email />} iconPosition="start" />
            {product?.seller?.phone && (
              <Tab value="phone" label="Call" icon={<Phone />} iconPosition="start" />
            )}
          </Tabs>
          {contactMethod === 'phone' ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body1" gutterBottom>
                Call the seller directly at:
              </Typography>
              <Typography variant="h6" color="primary">
                {product?.seller?.phone}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Phone />}
                sx={{ mt: 2 }}
                onClick={() => {
                  window.location.href = `tel:${product?.seller?.phone}`;
                  handleCloseContactDialog();
                }}
              >
                Call Now
              </Button>
            </Box>
          ) : (
            <>
              <TextField
                label="Message to Seller"
                multiline
                rows={4}
                fullWidth
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`I'm interested in your ${product?.title}. Is it still available?`}
                helperText={`Message will be sent to seller's email`}
                sx={{ mb: 3 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleCloseContactDialog} sx={{ mr: 1 }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  disabled={!messageText.trim()}
                  onClick={handleSendMessage}
                >
                  Send Message
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Dialog>
      
      {/* Checkout Dialog */}
      <Dialog
        open={checkoutDialogOpen}
        onClose={handleCloseCheckoutDialog}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ position: 'relative', p: 3 }}>
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={handleCloseCheckoutDialog}
          >
            <Close />
          </IconButton>
          
          <Typography variant="h5" gutterBottom>
            Checkout
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ my: 3 }}>
            <Step>
              <StepLabel>Payment Method</StepLabel>
            </Step>
            <Step>
              <StepLabel>Review Order</StepLabel>
            </Step>
            <Step>
              <StepLabel>Confirmation</StepLabel>
            </Step>
          </Stepper>
          
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Select Payment Method
              </Typography>
              
              <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
                <RadioGroup
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  <Paper sx={{ mb: 2, p: 2, border: '1px solid', borderColor: paymentMethod === 'credit_card' ? 'primary.main' : 'divider' }}>
                    <FormControlLabel 
                      value="credit_card" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CreditCard color="primary" sx={{ mr: 1 }} />
                          <Typography>Credit/Debit Card</Typography>
                        </Box>
                      } 
                    />
                    
                    {paymentMethod === 'credit_card' && (
                      <Box sx={{ pl: 4, pt: 2 }}>
                        <TextField
                          label="Card Number"
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          placeholder="**** **** **** ****"
                          value={cardDetails.cardNumber}
                          onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CreditScore />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          label="Cardholder Name"
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          placeholder="John Doe"
                          value={cardDetails.cardName}
                          onChange={(e) => setCardDetails({...cardDetails, cardName: e.target.value})}
                        />
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              label="Expiry Date"
                              fullWidth
                              variant="outlined"
                              margin="normal"
                              placeholder="MM/YY"
                              value={cardDetails.expiryDate}
                              onChange={(e) => setCardDetails({...cardDetails, expiryDate: e.target.value})}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              label="CVV"
                              fullWidth
                              variant="outlined"
                              margin="normal"
                              placeholder="***"
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </Paper>
                  
                  <Paper sx={{ mb: 2, p: 2, border: '1px solid', borderColor: paymentMethod === 'cod' ? 'primary.main' : 'divider' }}>
                    <FormControlLabel 
                      value="cod" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MoneyOff color="primary" sx={{ mr: 1 }} />
                          <Typography>Cash on Delivery</Typography>
                        </Box>
                      } 
                    />
                    
                    {paymentMethod === 'cod' && (
                      <Box sx={{ pl: 4, pt: 1 }}>
                        <Alert severity="info" sx={{ mt: 1 }}>
                          You will pay when the item is delivered to your address. 
                          Only available for delivery within 30 miles.
                        </Alert>
                        <TextField
                          label="Delivery Address"
                          fullWidth
                          multiline
                          rows={3}
                          variant="outlined"
                          margin="normal"
                          placeholder="Enter your full delivery address"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                        />
                      </Box>
                    )}
                  </Paper>
                  
                  <Paper sx={{ mb: 2, p: 2, border: '1px solid', borderColor: paymentMethod === 'bank_transfer' ? 'primary.main' : 'divider' }}>
                    <FormControlLabel 
                      value="bank_transfer" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccountBalance color="primary" sx={{ mr: 1 }} />
                          <Typography>Bank Transfer</Typography>
                        </Box>
                      } 
                    />
                    
                    {paymentMethod === 'bank_transfer' && (
                      <Box sx={{ pl: 4, pt: 1 }}>
                        <Alert severity="info" sx={{ mt: 1 }}>
                          Bank transfer details will be sent to your email after reviewing your order.
                        </Alert>
                      </Box>
                    )}
                  </Paper>
                </RadioGroup>
              </FormControl>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button onClick={handleCloseCheckoutDialog} sx={{ mr: 1 }}>
                  Cancel
                </Button>
                <Button 
                  variant="contained"
                  disabled={placingOrder}
                  onClick={handlePlaceOrder}
                  startIcon={placingOrder ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {placingOrder ? 'Processing...' : 'Place Order'}
                </Button>
              </Box>
            </Box>
          )}
          
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Review Your Order
              </Typography>
              
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Order Summary
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box 
                    component="img" 
                    src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/80x80?text=No+Image'}
                    alt={product.title}
                    sx={{ width: 80, height: 80, objectFit: 'cover', mr: 2, borderRadius: 1 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">
                      {product.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Condition: {product.condition?.charAt(0).toUpperCase() + product.condition?.slice(1) || 'N/A'}
                    </Typography>
                    {product.seller && (
                      <Typography variant="body2" color="text.secondary">
                        Seller: {product.seller.name}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    ${product.price?.toFixed(2)}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2">Subtotal:</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2">${product.price?.toFixed(2)}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2">Shipping:</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2">$5.00</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2">Tax:</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2">${(product.price * 0.08).toFixed(2)}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        ${(product.price + 5 + (product.price * 0.08)).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
              
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getPaymentMethodIcon(paymentMethod)}
                    <Typography variant="subtitle1" sx={{ ml: 1 }}>
                      Payment Method: {getPaymentMethodLabel(paymentMethod)}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {paymentMethod === 'credit_card' && (
                    <Box>
                      <Typography variant="body2">
                        Card ending in {cardDetails.cardNumber.slice(-4) || '****'}
                      </Typography>
                      <Typography variant="body2">
                        Name: {cardDetails.cardName || 'Not provided'}
                      </Typography>
                    </Box>
                  )}
                  
                  {paymentMethod === 'cod' && (
                    <Box>
                      <Typography variant="body2">
                        You will pay ${(product.price + 5 + (product.price * 0.08)).toFixed(2)} when the item is delivered.
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Delivery Address: {shippingAddress || 'Not provided'}
                      </Typography>
                    </Box>
                  )}
                  
                  {paymentMethod === 'bank_transfer' && (
                    <Typography variant="body2">
                      Bank transfer details will be sent to your email after order confirmation.
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Box>
                  <Button onClick={handleCloseCheckoutDialog} sx={{ mr: 1 }}>
                    Cancel
                  </Button>
                  <Button 
                    variant="contained"
                    disabled={placingOrder}
                    onClick={handlePlaceOrder}
                    startIcon={placingOrder ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {placingOrder ? 'Processing...' : 'Place Order'}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
          
          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Order Complete!
              </Typography>
              <Typography variant="body1" paragraph>
                Thank you for your order. Your transaction was successful.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {paymentMethod === 'cod' 
                  ? 'You will pay when the item is delivered to your address.' 
                  : 'You will receive a confirmation email shortly.'}
              </Typography>
              <Button 
                variant="contained" 
                onClick={handleCloseCheckoutDialog}
                sx={{ mt: 2 }}
              >
                Done
              </Button>
            </Box>
          )}
        </Box>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {"Delete Product Listing?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{product?.title}"? This action cannot be undone.
            All associated data, including images, will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default ProductDetail; 