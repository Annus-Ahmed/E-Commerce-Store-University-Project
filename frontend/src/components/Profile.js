import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Grid,
    Avatar,
    IconButton,
    Divider,
    Chip,
    useTheme,
    Alert,
    Snackbar,
    Tabs,
    Tab,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    CircularProgress,
    Badge,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stack,
    Rating,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { 
    Edit, 
    Save, 
    Cancel, 
    Person, 
    ShoppingBag, 
    Favorite, 
    Delete, 
    Visibility, 
    Refresh, 
    Store, 
    Add, 
    Message, 
    PhotoCamera, 
    AccessTime, 
    Assessment,
    Verified,
    Star,
    StarBorder,
    History,
    DonutLarge,
    TrendingUp,
    AutoGraph,
    PersonAdd,
    VerifiedUser
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import OrderHistory from './OrderHistory';
import ListNewItem from './ListNewItem';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format, formatDistanceToNow } from 'date-fns';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Create new Wishlist component
const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/users/wishlist');
            
            // Check if data is valid and properly populated
            if (Array.isArray(response.data)) {
                // Filter out any invalid products (missing required fields)
                const validProducts = response.data.filter(product => 
                    product && product._id && typeof product !== 'string'
                );
                setWishlistItems(validProducts);
                setError(null);
            } else {
                console.error('Invalid wishlist data format:', response.data);
                setError('Received invalid wishlist data format from server');
            }
        } catch (err) {
            console.error('Error fetching wishlist:', err);
            if (err.response) {
                // Server responded with an error status
                setError(`Failed to load wishlist: ${err.response.data.message || err.response.statusText}`);
            } else if (err.request) {
                // Request was made but no response received
                setError('Network error. Please check your connection and try again.');
            } else {
                // Something happened in setting up the request
                setError('Failed to load your wishlist. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchWishlist().finally(() => setRefreshing(false));
    };

    const handleRemoveFromWishlist = async (productId, productTitle) => {
        try {
            const response = await axios.delete(`/api/users/wishlist/${productId}`);
            
            if (response.status === 200) {
                // Update state after successful removal
                setWishlistItems(wishlistItems.filter(item => item._id !== productId));
                setSnackbarMessage(`${productTitle} removed from wishlist`);
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            } else {
                throw new Error('Unexpected response status');
            }
        } catch (err) {
            console.error('Error removing item from wishlist:', err);
            const errorMessage = err.response?.data?.message || 'Failed to remove item from wishlist';
            setSnackbarMessage(errorMessage);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
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

    if (wishlistItems.length === 0) {
        return (
            <Box sx={{ my: 2 }}>
                <Alert severity="info">
                    Your wishlist is empty. Browse products and click "Save" to add items to your wishlist.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    My Wishlist ({wishlistItems.length} items)
                </Typography>
                <Button 
                    startIcon={<Refresh />}
                    onClick={handleRefresh}
                    disabled={refreshing}
                    size="small"
                >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
            </Box>
            <Grid container spacing={3}>
                {wishlistItems.map((product) => (
                    <Grid 
                        item 
                        xs={12} 
                        sm={6} 
                        md={4} 
                        key={product._id}
                        component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card 
                            sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6
                                },
                                position: 'relative'
                            }}
                        >
                            {!product.isAvailable && (
                                <Box 
                                    sx={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        bgcolor: 'error.main',
                                        color: 'white',
                                        py: 0.5,
                                        px: 1,
                                        borderRadius: 1,
                                        zIndex: 1,
                                        transform: 'rotate(5deg)'
                                    }}
                                >
                                    <Typography variant="caption" fontWeight="bold">
                                        SOLD
                                    </Typography>
                                </Box>
                            )}
                            
                            <CardMedia
                                component="img"
                                height="160"
                                image={product.images && product.images.length > 0 
                                    ? getFullImageUrl(product.images[0])
                                    : 'https://via.placeholder.com/300x200?text=No+Image'}
                                alt={product.title}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h6" component="h2" noWrap>
                                    {product.title}
                                </Typography>
                                <Typography 
                                    variant="h6" 
                                    color="primary" 
                                    sx={{ fontWeight: 'bold', mb: 1 }}
                                >
                                    ${product.price?.toFixed(2)}
                                </Typography>
                                <Box sx={{ mb: 1 }}>
                                    {product.category && (
                                        <Chip 
                                            label={product.category.charAt(0).toUpperCase() + product.category.slice(1)} 
                                            size="small" 
                                            color="secondary" 
                                            sx={{ mr: 1 }}
                                        />
                                    )}
                                    {product.condition && (
                                        <Chip 
                                            label={product.condition.charAt(0).toUpperCase() + product.condition.slice(1)} 
                                            size="small" 
                                            variant="outlined"
                                        />
                                    )}
                                </Box>
                                
                                <Typography
                                    variant="body2" 
                                    color="text.secondary" 
                                    sx={{ 
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                >
                                    {product.description}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button 
                                    size="small" 
                                    variant="contained"
                                    component={Link}
                                    to={`/products/${product._id}`}
                                    startIcon={<Visibility />}
                                    sx={{ flexGrow: 1 }}
                                >
                                    View Details
                                </Button>
                                
                                <IconButton
                                    color="error"
                                    onClick={() => handleRemoveFromWishlist(product._id, product.title)}
                                    size="small"
                                >
                                    <Delete />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

// ProfileStats component displays seller's performance metrics
const ProfileStats = ({ userData }) => {
    const [stats, setStats] = useState({
        totalListings: 0,
        activeSales: 0,
        completedSales: 0,
        viewCount: 0,
        averageRating: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // In a real app, you would fetch this data from your API
                // For now, we'll use the listings data we already have
                if (userData && userData.listings) {
                    const totalListings = userData.listings.length;
                    const activeSales = userData.listings.filter(item => item.isAvailable).length;
                    const completedSales = userData.listings.filter(item => !item.isAvailable).length;
                    
                    // Simulated data
                    const viewCount = totalListings * Math.floor(Math.random() * 20) + 5;
                    const averageRating = userData.ratings?.average || (3 + Math.random() * 2).toFixed(1);
                    
                    setStats({
                        totalListings,
                        activeSales,
                        completedSales,
                        viewCount,
                        averageRating
                    });
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchStats();
    }, [userData]);
    
    if (loading) {
        return <Box sx={{ pt: 2 }}><CircularProgress size={24} /></Box>;
    }
    
    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
                <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Seller Statistics
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
                <Grid item xs={6} sm={4} md={2}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                        <Typography variant="h4" color="primary" fontWeight="bold">
                            {stats.totalListings}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Listings
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                        <Typography variant="h4" color="success.main" fontWeight="bold">
                            {stats.activeSales}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Active Sales
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                        <Typography variant="h4" color="secondary.main" fontWeight="bold">
                            {stats.completedSales}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Completed Sales
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                        <Typography variant="h4" fontWeight="bold">
                            {stats.viewCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Views
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={4}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h4" color="warning.main" fontWeight="bold" sx={{ mr: 1 }}>
                                {stats.averageRating}
                            </Typography>
                            <Box>
                                <Rating 
                                    value={parseFloat(stats.averageRating)} 
                                    precision={0.5} 
                                    readOnly 
                                    size="small"
                                />
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Seller Rating
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

// ProfileCompleteness component to encourage users to complete their profile
const ProfileCompleteness = ({ userData }) => {
    // Calculate profile completeness
    const calculateCompleteness = () => {
        if (!userData) return 0;
        
        const fields = [
            !!userData.name,
            !!userData.email,
            !!userData.phone,
            !!userData.bio,
            !!(userData.address && userData.address.street),
            !!(userData.address && userData.address.city),
            !!(userData.address && userData.address.state),
            !!(userData.address && userData.address.zipCode),
            !!(userData.address && userData.address.country),
            !!userData.profileImage
        ];
        
        const filledFields = fields.filter(Boolean).length;
        return (filledFields / fields.length) * 100;
    };
    
    const completeness = calculateCompleteness();
    
    // Determine completeness level and suggestions
    const getCompletenessInfo = () => {
        if (completeness < 40) {
            return {
                color: 'error',
                level: 'Basic',
                message: 'Your profile is barely started. Add more details to improve visibility.'
            };
        } else if (completeness < 70) {
            return {
                color: 'warning',
                level: 'Good',
                message: 'Your profile is looking good! Add missing details to stand out.'
            };
        } else {
            return {
                color: 'success',
                level: 'Excellent',
                message: 'Your profile is comprehensive and will make a great impression!'
            };
        }
    };
    
    const info = getCompletenessInfo();
    
    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">
                    <VerifiedUser sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Profile Completeness
                </Typography>
                <Chip 
                    label={info.level} 
                    color={info.color} 
                    size="small"
                    variant="outlined"
                />
            </Box>
            
            <Box sx={{ mt: 2, mb: 1 }}>
                <LinearProgress 
                    variant="determinate" 
                    value={completeness} 
                    color={info.color}
                    sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'right' }}>
                    {completeness.toFixed(0)}% Complete
                </Typography>
            </Box>
            
            <Alert severity={info.color} sx={{ mt: 2 }}>
                {info.message}
            </Alert>
        </Paper>
    );
};

// ActivityTimeline component to show recent user activity
const ActivityTimeline = ({ userData }) => {
    // Use real activity dates from userData
    const activities = [
        { 
            type: 'join', 
            time: userData?.joinedDate || userData?.createdAt || new Date(), 
            description: 'Joined Pre-Owned Marketplace' 
        },
        userData?.becameSellerAt && {
            type: 'role',
            time: userData.becameSellerAt,
            description: 'Became a seller'
        },
        userData?.listings && userData.listings.length > 0 && {
            type: 'listing',
            time: userData.listings[0].createdAt,
            description: 'Added a new product listing'
        },
        userData?.updatedAt && {
            type: 'profile_update',
            time: userData.updatedAt,
            description: 'Updated profile information'
        }
    ].filter(Boolean);
    
    // Sort activities by date, newest first
    const sortedActivities = [...activities].sort((a, b) => new Date(b.time) - new Date(a.time));
    
    const getActivityIcon = (type) => {
        switch (type) {
            case 'join': return <PersonAdd color="primary" />;
            case 'profile_update': return <Edit color="secondary" />;
            case 'listing': return <Add color="success" />;
            case 'role': return <Store color="warning" />;
            default: return <History />;
        }
    };
    
    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
                <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
                {sortedActivities.map((activity, index) => (
                    <ListItem 
                        key={index}
                        sx={{
                            borderLeft: '2px solid',
                            borderColor: 'divider',
                            position: 'relative',
                            '&:not(:last-child)': {
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    left: '-5px',
                                    top: '40px',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: 'primary.main'
                                }
                            }
                        }}
                    >
                        <ListItemIcon>
                            {getActivityIcon(activity.type)}
                        </ListItemIcon>
                        <ListItemText
                            primary={activity.description}
                            secondary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {format(new Date(activity.time), 'MMM d, yyyy')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                                    </Typography>
                                </Box>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
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

const Profile = () => {
    const { user, updateProfile, fetchUserProfile } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [becomingSellerLoading, setBecomingSellerLoading] = useState(false);
    const [profileCompleteness, setProfileCompleteness] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const fileInputRef = useRef(null);
    const theme = useTheme();

    // Form validation schema
    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
        phone: Yup.string(),
        bio: Yup.string().max(500, 'Bio must be at most 500 characters'),
        street: Yup.string(),
        city: Yup.string(),
        state: Yup.string(),
        zipCode: Yup.string(),
        country: Yup.string()
    });

    // Initialize formik form state
    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            phone: '',
            bio: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                // Create the update payload
                const userData = {
                    name: values.name,
                    phone: values.phone,
                    bio: values.bio,
                    address: {
                        street: values.street,
                        city: values.city,
                        state: values.state,
                        zipCode: values.zipCode,
                        country: values.country
                    }
                };

                // Handle profile image upload if selected
                if (avatarFile) {
                    const formData = new FormData();
                    formData.append('profileImage', avatarFile);
                    
                    // Upload the profile image first
                    const uploadResponse = await axios.post('/api/users/profile/avatar', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    
                    if (uploadResponse.data && uploadResponse.data.profileImage) {
                        userData.profileImage = uploadResponse.data.profileImage;
                    }
                }

                // Update the user profile
                await updateProfile(userData);
                
                // Show success message
                setSuccessMessage('Profile updated successfully');
                setShowSuccess(true);
                
                // Exit edit mode
                setEditMode(false);
                
                // Refresh profile data
                fetchUserData();

                // Clear preview and file
                setAvatarPreview(null);
                setAvatarFile(null);
            } catch (error) {
                console.error('Profile update error:', error);
                setErrorMessage(error.response?.data?.message || 'Failed to update profile');
                setShowError(true);
            }
        }
    });

    useEffect(() => {
        fetchUserData();
        fetchOrderHistory();
    }, [user?._id]);

    // Function to fetch user profile data
    const fetchUserData = async () => {
        try {
            setLoading(true);
            
            // Get the user's profile data
            const profileResponse = await axios.get('/api/users/profile');
            const userData = profileResponse.data;

            // Get the user's listings
            const listingsResponse = await axios.get('/api/users/listings');
            const listingsData = listingsResponse.data;

            setProfileData({
                ...userData,
                listings: listingsData
            });

            // Calculate profile completeness
            calculateProfileCompleteness(userData);

            // Set form values
            formik.setValues({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                bio: userData.bio || '',
                street: userData.address?.street || '',
                city: userData.address?.city || '',
                state: userData.address?.state || '',
                zipCode: userData.address?.zipCode || '',
                country: userData.address?.country || ''
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
            setErrorMessage('Failed to load profile data. Please try again.');
            setShowError(true);
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch user's order history
    const fetchOrderHistory = async () => {
        try {
            setLoadingOrders(true);
            const response = await axios.get('/api/orders/myorders');
            setRecentOrders(response.data);
        } catch (error) {
            console.error('Error fetching order history:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    // Calculate profile completeness
    const calculateProfileCompleteness = (userData) => {
        if (!userData) {
            setProfileCompleteness(0);
            return;
        }
        
        const fields = [
            !!userData.name,
            !!userData.email,
            !!userData.phone,
            !!userData.bio,
            !!(userData.address && userData.address.street),
            !!(userData.address && userData.address.city),
            !!(userData.address && userData.address.state),
            !!(userData.address && userData.address.zipCode),
            !!(userData.address && userData.address.country),
            !!userData.profileImage
        ];
        
        const filledFields = fields.filter(Boolean).length;
        const completeness = (filledFields / fields.length) * 100;
        setProfileCompleteness(completeness);
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleAvatarClick = () => {
        if (editMode) {
            fileInputRef.current.click();
        }
    };

    const getDefaultAvatar = (name) => {
        // Generate a color based on the name
        const stringToColor = (string) => {
            let hash = 0;
            for (let i = 0; i < string.length; i++) {
                hash = string.charCodeAt(i) + ((hash << 5) - hash);
            }
            let color = '#';
            for (let i = 0; i < 3; i++) {
                const value = (hash >> (i * 8)) & 0xFF;
                color += ('00' + value.toString(16)).substr(-2);
            }
            return color;
        };

        // Get the initial letters of the name
        const getInitials = (name) => {
            if (!name) return 'U';
            return name
                .split(' ')
                .map(part => part[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
        };

        return {
            sx: {
                bgcolor: stringToColor(name || 'User'),
            },
            children: getInitials(name),
        };
    };

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleCancel = () => {
        setEditMode(false);
        setAvatarPreview(null);
        setAvatarFile(null);
        
        // Reset form values to original profile data
        if (profileData) {
            formik.setValues({
                name: profileData.name || '',
                email: profileData.email || '',
                phone: profileData.phone || '',
                bio: profileData.bio || '',
                street: profileData.address?.street || '',
                city: profileData.address?.city || '',
                state: profileData.address?.state || '',
                zipCode: profileData.address?.zipCode || '',
                country: profileData.address?.country || ''
            });
        }
    };

    const handleCloseError = () => {
        setShowError(false);
    };

    const handleCloseSuccess = () => {
        setShowSuccess(false);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleBecomeSeller = async () => {
        try {
            setBecomingSellerLoading(true);
            setErrorMessage('');
            setShowError(false);
            
            // Make API request
            const response = await axios.post('/api/users/become-seller');
            
            if (response.data && response.data.user) {
                // Update localStorage with new role
                localStorage.setItem('userRole', 'seller');
                
                // Update local state
                setProfileData({
                    ...profileData,
                    role: 'seller'
                });
                
                // Success message
                setSuccessMessage('You are now registered as a seller! You can list products for sale.');
                setShowSuccess(true);
                
                // Update the auth context
                if (fetchUserProfile) {
                    await fetchUserProfile();
                }
                
                // Reset to the first tab
                setTabValue(0);
                
                // Reload the page to apply all changes
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                throw new Error('Invalid server response');
            }
        } catch (error) {
            let errorMsg = 'Failed to register as a seller';
            
            if (error.response && error.response.data) {
                errorMsg = error.response.data.message || errorMsg;
            } else if (error.request) {
                errorMsg = 'No response from server. Please check your connection.';
            } else {
                errorMsg = error.message || errorMsg;
            }
            
            setErrorMessage(errorMsg);
            setShowError(true);
        } finally {
            setBecomingSellerLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Snackbar 
                open={showError} 
                autoHideDuration={6000} 
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>

            <Snackbar 
                open={showSuccess} 
                autoHideDuration={6000} 
                onClose={handleCloseSuccess}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>

            <Paper 
                elevation={3} 
                sx={{ 
                    p: { xs: 2, sm: 4 }, 
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    mb: 4
                }}
            >
                {/* Profile Header */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' }, 
                        alignItems: { xs: 'center', sm: 'flex-start' },
                        mb: 3 
                    }}
                >
                    {/* Avatar Section */}
                    <Box sx={{ mr: { xs: 0, sm: 4 }, mb: { xs: 2, sm: 0 }, position: 'relative' }}>
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                        />
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                                profileData?.role === 'seller' ? (
                                    <Verified color="primary" fontSize="large" />
                                ) : null
                            }
                        >
                            {avatarPreview ? (
                                <Avatar 
                                    src={avatarPreview} 
                                    sx={{ 
                                        width: 120, 
                                        height: 120,
                                        cursor: editMode ? 'pointer' : 'default',
                                        border: profileData?.role === 'seller' ? '3px solid' : 'none',
                                        borderColor: 'primary.main'
                                    }}
                                    onClick={handleAvatarClick}
                                />
                            ) : profileData?.profileImage ? (
                                <Avatar 
                                    src={`http://localhost:5001/${profileData.profileImage}`}
                                    sx={{ 
                                        width: 120, 
                                        height: 120,
                                        cursor: editMode ? 'pointer' : 'default',
                                        border: profileData?.role === 'seller' ? '3px solid' : 'none',
                                        borderColor: 'primary.main'
                                    }}
                                    onClick={handleAvatarClick}
                                />
                            ) : (
                                <Avatar 
                                    {...getDefaultAvatar(profileData?.name)}
                                    sx={{ 
                                        width: 120, 
                                        height: 120,
                                        fontSize: 48,
                                        cursor: editMode ? 'pointer' : 'default',
                                        border: profileData?.role === 'seller' ? '3px solid' : 'none',
                                        borderColor: 'primary.main',
                                        ...getDefaultAvatar(profileData?.name).sx
                                    }}
                                    onClick={handleAvatarClick}
                                />
                            )}
                        </Badge>
                        {editMode && (
                            <IconButton 
                                sx={{ 
                                    position: 'absolute', 
                                    bottom: 0, 
                                    right: 0,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                                }}
                                onClick={handleAvatarClick}
                            >
                                <PhotoCamera />
                            </IconButton>
                        )}
                    </Box>
                    
                    {/* User info and actions */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" gutterBottom>
                            {profileData?.name}'s Profile
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                Member since:
                            </Typography>
                            <Typography variant="body2">
                                {profileData?.joinedDate ? new Date(profileData.joinedDate).toLocaleDateString() : 'N/A'}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Chip 
                                label={profileData?.role === 'seller' ? 'Verified Seller' : profileData?.role === 'admin' ? 'Admin' : 'Buyer'} 
                                color={profileData?.role === 'seller' ? 'success' : profileData?.role === 'admin' ? 'error' : 'primary'} 
                                size="small" 
                                icon={profileData?.role === 'seller' ? <Verified /> : undefined}
                                sx={{ mr: 1 }}
                            />
                            {profileData?.ratings && profileData.ratings.average > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                    <Rating 
                                        value={profileData.ratings.average} 
                                        readOnly 
                                        size="small"
                                        precision={0.5}
                                    />
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                        ({profileData.ratings.count} ratings)
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        
                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {!editMode ? (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Edit />}
                                    onClick={handleEdit}
                                >
                                    Edit Profile
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Save />}
                                        onClick={formik.handleSubmit}
                                        disabled={formik.isSubmitting}
                                    >
                                        {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        startIcon={<Cancel />}
                                        onClick={handleCancel}
                                        disabled={formik.isSubmitting}
                                        sx={{ ml: 1 }}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            )}
                            
                            {!editMode && profileData?.role !== 'seller' && (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<Store />}
                                    onClick={handleBecomeSeller}
                                    disabled={becomingSellerLoading}
                                    sx={{ ml: 1 }}
                                >
                                    {becomingSellerLoading ? 'Processing...' : 'Become a Seller'}
                                </Button>
                            )}
                            
                            {profileData?.role === 'seller' && (
                                <Button
                                    variant="outlined"
                                    color="success"
                                    component={Link}
                                    to="/list-item"
                                    startIcon={<Add />}
                                    sx={{ ml: 1 }}
                                >
                                    List New Item
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Profile Completeness Indicator */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Profile Completeness:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                            {profileCompleteness.toFixed(0)}%
                        </Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={profileCompleteness} 
                        color={
                            profileCompleteness < 40 ? "error" : 
                            profileCompleteness < 70 ? "warning" : "success"
                        }
                        sx={{ height: 6, borderRadius: 3 }}
                    />
                </Box>

                {/* Tabs Navigation */}
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs 
                            value={tabValue} 
                            onChange={handleTabChange} 
                            aria-label="profile tabs"
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab label="Account" icon={<Person />} iconPosition="start" />
                            <Tab label="Wishlist" icon={<Favorite />} iconPosition="start" />
                            {profileData?.role === 'seller' && (
                                <Tab label="My Listings" icon={<ShoppingBag />} iconPosition="start" />
                            )}
                            <Tab label="Orders" icon={<History />} iconPosition="start" />
                            <Tab label="Activity" icon={<AccessTime />} iconPosition="start" />
                        </Tabs>
                    </Box>
                    
                    {/* Account Tab */}
                    <TabPanel value={tabValue} index={0}>
                        {/* Render profile completeness widget */}
                        {!editMode && <ProfileCompleteness userData={profileData} />}
                        
                        {/* Render seller stats if user is a seller */}
                        {!editMode && profileData?.role === 'seller' && (
                            <ProfileStats userData={profileData} />
                        )}
                        
                        {/* Edit Mode Form */}
                        {editMode ? (
                            <form onSubmit={formik.handleSubmit}>
                                <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                        Personal Information
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                id="name"
                                                name="name"
                                                label="Full Name"
                                                value={formik.values.name}
                                                onChange={formik.handleChange}
                                                error={formik.touched.name && Boolean(formik.errors.name)}
                                                helperText={formik.touched.name && formik.errors.name}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                id="email"
                                                name="email"
                                                label="Email Address"
                                                value={formik.values.email}
                                                onChange={formik.handleChange}
                                                error={formik.touched.email && Boolean(formik.errors.email)}
                                                helperText={formik.touched.email && formik.errors.email}
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                id="phone"
                                                name="phone"
                                                label="Phone Number"
                                                value={formik.values.phone}
                                                onChange={formik.handleChange}
                                                error={formik.touched.phone && Boolean(formik.errors.phone)}
                                                helperText={formik.touched.phone && formik.errors.phone}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                id="bio"
                                                name="bio"
                                                label="Bio"
                                                value={formik.values.bio}
                                                onChange={formik.handleChange}
                                                error={formik.touched.bio && Boolean(formik.errors.bio)}
                                                helperText={formik.touched.bio && formik.errors.bio}
                                                multiline
                                                rows={3}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>

                                <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                        Address Information
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                id="street"
                                                name="street"
                                                label="Street Address"
                                                value={formik.values.street}
                                                onChange={formik.handleChange}
                                                error={formik.touched.street && Boolean(formik.errors.street)}
                                                helperText={formik.touched.street && formik.errors.street}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                id="city"
                                                name="city"
                                                label="City"
                                                value={formik.values.city}
                                                onChange={formik.handleChange}
                                                error={formik.touched.city && Boolean(formik.errors.city)}
                                                helperText={formik.touched.city && formik.errors.city}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                id="state"
                                                name="state"
                                                label="State/Province"
                                                value={formik.values.state}
                                                onChange={formik.handleChange}
                                                error={formik.touched.state && Boolean(formik.errors.state)}
                                                helperText={formik.touched.state && formik.errors.state}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                id="zipCode"
                                                name="zipCode"
                                                label="Zip/Postal Code"
                                                value={formik.values.zipCode}
                                                onChange={formik.handleChange}
                                                error={formik.touched.zipCode && Boolean(formik.errors.zipCode)}
                                                helperText={formik.touched.zipCode && formik.errors.zipCode}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                id="country"
                                                name="country"
                                                label="Country"
                                                value={formik.values.country}
                                                onChange={formik.handleChange}
                                                error={formik.touched.country && Boolean(formik.errors.country)}
                                                helperText={formik.touched.country && formik.errors.country}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </form>
                        ) : (
                            <>
                                <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                        Personal Information
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Full Name
                                            </Typography>
                                            <Typography variant="body1">
                                                {profileData?.name}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Email Address
                                            </Typography>
                                            <Typography variant="body1">
                                                {profileData?.email}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Phone Number
                                            </Typography>
                                            <Typography variant="body1">
                                                {profileData?.phone || 'Not provided'}
                                            </Typography>
                                        </Grid>
                                        {profileData?.bio && (
                                            <Grid item xs={12}>
                                                <Divider sx={{ my: 1 }} />
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Bio
                                                </Typography>
                                                <Typography variant="body1">
                                                    {profileData.bio}
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Paper>
                                
                                {profileData?.address && Object.values(profileData.address).some(value => value) ? (
                                    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                            Address Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {profileData.address.street && (
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Street Address
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {profileData.address.street}
                                                    </Typography>
                                                </Grid>
                                            )}
                                            <Grid item xs={12} sm={4}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    City
                                                </Typography>
                                                <Typography variant="body1">
                                                    {profileData.address.city || 'Not provided'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    State/Province
                                                </Typography>
                                                <Typography variant="body1">
                                                    {profileData.address.state || 'Not provided'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Zip/Postal Code
                                                </Typography>
                                                <Typography variant="body1">
                                                    {profileData.address.zipCode || 'Not provided'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Country
                                                </Typography>
                                                <Typography variant="body1">
                                                    {profileData.address.country || 'Not provided'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                ) : (
                                    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                Address Information
                                            </Typography>
                                            <Button size="small" startIcon={<Edit />} onClick={handleEdit}>Add Address</Button>
                                        </Box>
                                        <Alert severity="info" sx={{ mt: 2 }}>
                                            No address information provided. Adding your address helps with local transactions.
                                        </Alert>
                                    </Paper>
                                )}
                            </>
                        )}
                    </TabPanel>
                    
                    {/* Wishlist Tab */}
                    <TabPanel value={tabValue} index={1}>
                        <Wishlist />
                    </TabPanel>
                    
                    {/* My Listings Tab (for sellers only) */}
                    {profileData?.role === 'seller' && (
                        <TabPanel value={tabValue} index={2}>
                            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">
                                        My Product Listings
                                    </Typography>
                                    <Button 
                                        variant="contained"
                                        color="primary"
                                        component={Link}
                                        to="/list-item"
                                        startIcon={<Add />}
                                    >
                                        Add New Listing
                                    </Button>
                                </Box>
                                
                                {profileData?.listings?.length > 0 ? (
                                    <Grid container spacing={3}>
                                        {profileData.listings.map((item) => (
                                            <Grid item xs={12} sm={6} md={4} key={item._id}>
                                                <Card 
                                                    sx={{ 
                                                        height: '100%', 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        transition: 'transform 0.2s',
                                                        '&:hover': { transform: 'translateY(-4px)' }
                                                    }}
                                                >
                                                    <CardMedia
                                                        component="img"
                                                        height="200"
                                                        image={item.images && item.images.length > 0 
                                                            ? getFullImageUrl(item.images[0])
                                                            : '/placeholder-image.jpg'}
                                                        alt={item.title}
                                                    />
                                                    <CardContent sx={{ flexGrow: 1 }}>
                                                        <Typography variant="h6" component="div" noWrap>
                                                            {item.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                                        </Typography>
                                                        <Typography variant="h6" color="primary" gutterBottom>
                                                            ${item.price.toFixed(2)}
                                                        </Typography>
                                                        <Chip 
                                                            label={item.isAvailable ? 'Active' : 'Sold'}
                                                            color={item.isAvailable ? 'success' : 'default'}
                                                            size="small"
                                                        />
                                                    </CardContent>
                                                    <CardActions>
                                                        <Button 
                                                            size="small" 
                                                            component={Link}
                                                            to={`/products/${item._id}`}
                                                            startIcon={<Visibility />}
                                                        >
                                                            View
                                                        </Button>
                                                        <Button 
                                                            size="small"
                                                            component={Link}
                                                            to={`/edit-item/${item._id}`}
                                                            startIcon={<Edit />}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </CardActions>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Alert severity="info">
                                        You haven't listed any products yet. Click "Add New Listing" to create your first listing.
                                    </Alert>
                                )}
                            </Paper>
                        </TabPanel>
                    )}
                    
                    {/* Orders Tab */}
                    <TabPanel value={tabValue} index={profileData?.role === 'seller' ? 3 : 2}>
                        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Order History
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            {loadingOrders ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : recentOrders.length > 0 ? (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Order ID</TableCell>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Product</TableCell>
                                                <TableCell>Amount</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {recentOrders.map((order) => (
                                                <TableRow key={order._id}>
                                                    <TableCell>{order._id.substring(0, 8)}</TableCell>
                                                    <TableCell>
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {order.product ? order.product.title : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>${order.totalAmount?.toFixed(2) || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={order.status} 
                                                            color={
                                                                order.status === 'completed' ? 'success' :
                                                                order.status === 'pending' ? 'warning' :
                                                                'default'
                                                            }
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button 
                                                            size="small"
                                                            component={Link}
                                                            to={`/orders/${order._id}`}
                                                        >
                                                            Details
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Alert severity="info">
                                    You don't have any orders yet. Browse products and make your first purchase!
                                </Alert>
                            )}
                        </Paper>
                    </TabPanel>
                    
                    {/* Activity Tab */}
                    <TabPanel value={tabValue} index={profileData?.role === 'seller' ? 4 : 3}>
                        <ActivityTimeline userData={profileData} />
                    </TabPanel>
                </Box>
            </Paper>
        </Container>
    );
};

export default Profile; 