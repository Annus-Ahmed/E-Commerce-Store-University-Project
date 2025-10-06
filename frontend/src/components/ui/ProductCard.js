import React, { useState } from 'react';
import { 
  Card, 
  CardActionArea, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  IconButton, 
  Rating, 
  Tooltip,
  Skeleton,
  CardActions,
  Button
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder, 
  ShoppingCart, 
  Visibility, 
  BookmarkBorder, 
  Bookmark 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Helper function to format price
const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(price)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
};

// Helper function to get condition color
const getConditionColor = (condition) => {
  switch (condition?.toLowerCase()) {
    case 'new':
      return 'success';
    case 'like-new':
      return 'info';
    case 'good':
      return 'primary';
    case 'fair':
      return 'warning';
    case 'poor':
      return 'error';
    default:
      return 'default';
  }
};

const ProductCard = ({ 
  product, 
  onAddToWishlist, 
  onAddToCart,
  loading = false
}) => {
  const { user } = useAuth();
  const [inWishlist, setInWishlist] = useState(product?.inWishlist || false);
  const [hovering, setHovering] = useState(false);

  // Default image if none provided
  const defaultImage = 'https://via.placeholder.com/300x200?text=No+Image';
  
  // Get the primary image
  const primaryImage = product?.images?.length > 0 
    ? product.images[0] 
    : defaultImage;
  
  // Get the secondary image for hover effect
  const secondaryImage = product?.images?.length > 1
    ? product.images[1]
    : primaryImage;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onAddToWishlist) {
      onAddToWishlist(product._id);
    }
    
    setInWishlist(!inWishlist);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onAddToCart) {
      onAddToCart(product._id);
    }
  };

  if (loading) {
    return (
      <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Skeleton variant="rectangular" height={200} animation="wave" />
        <CardContent>
          <Skeleton variant="text" width="80%" height={24} animation="wave" />
          <Skeleton variant="text" width="60%" height={20} animation="wave" />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Skeleton variant="text" width="40%" height={28} animation="wave" />
            <Skeleton variant="circular" width={36} height={36} animation="wave" />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card 
        elevation={2}
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            boxShadow: 8,
          },
        }}
      >
        <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 2 }}>
          <Chip 
            label={product.category} 
            size="small" 
            color="primary"
            sx={{ 
              borderRadius: 1, 
              fontWeight: 'medium',
              textTransform: 'capitalize',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }} 
          />
        </Box>
        
        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
          <Chip 
            label={product.condition} 
            size="small" 
            color={getConditionColor(product.condition)}
            sx={{ 
              borderRadius: 1, 
              fontWeight: 'medium',
              textTransform: 'capitalize',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }} 
          />
        </Box>

        <CardActionArea 
          component={Link} 
          to={`/products/${product._id}`}
          sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <Box sx={{ position: 'relative', overflow: 'hidden', paddingTop: '66.67%' /* 3:2 aspect ratio */ }}>
            {/* Sold Out Overlay */}
            {product.isAvailable === false && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-25deg)',
                  bgcolor: 'error.main',
                  color: 'white',
                  px: 3,
                  py: 1,
                  borderRadius: 0,
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  zIndex: 3,
                  boxShadow: 3,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  width: '130%',
                  textAlign: 'center'
                }}
              >
                Sold Out
              </Box>
            )}
            <CardMedia
              component="img"
              image={hovering ? secondaryImage : primaryImage}
              alt={product.title}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease-in-out',
                opacity: product.isAvailable === false ? 0.6 : 1,
                filter: product.isAvailable === false ? 'grayscale(30%)' : 'none',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />
          </Box>

          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography 
              variant="h6" 
              component="h2" 
              gutterBottom 
              noWrap
              title={product.title}
              sx={{ fontWeight: 600 }}
            >
              {product.title}
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 1.5,
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                height: '40px'
              }}
            >
              {product.description}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
              <Typography 
                variant="h6" 
                color="primary.main"
                sx={{ fontWeight: 700 }}
              >
                {formatPrice(product.price)}
              </Typography>
              
              {product.rating > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating value={product.rating} precision={0.5} size="small" readOnly />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    ({product.reviewCount || 0})
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </CardActionArea>
        
        <CardActions sx={{ justifyContent: 'center', px: 2, py: 1 }}>
          <Button 
            component={Link} 
            to={`/products/${product._id}`}
            variant="contained"
            color="primary"
            size="small"
            fullWidth
          >
            View Details
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};

export default ProductCard; 