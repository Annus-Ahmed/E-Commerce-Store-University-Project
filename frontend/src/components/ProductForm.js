import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  useTheme,
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';
import { Add, PhotoCamera, Delete, Store } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProductForm = ({ editMode = false, product = null }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: urlProductId } = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(['electronics', 'furniture', 'clothing', 'books', 'toys', 'sports', 'automotive', 'other']);
  const [newTag, setNewTag] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState(editMode && product ? product.images : []);
  const [imagesToUpload, setImagesToUpload] = useState([]);
  const fileInputRef = useRef(null);
  
  // Add new state to track if we've loaded the product data
  const [productData, setProductData] = useState(null);

  // Add useEffect to fetch product data if in edit mode but product is null
  useEffect(() => {
    if (editMode && (product?._id || urlProductId)) {
      const productId = product?._id || urlProductId;
      setLoading(true);
      axios.get(`/api/products/${productId}`)
        .then(response => {
          setProductData(response.data);
          setImagePreviewUrls(response.data.images || []);
        })
        .catch(error => {
          console.error('Error fetching product data:', error);
          setErrorMessage('Failed to load product data. Please try again.');
          setShowError(true);
        })
        .finally(() => setLoading(false));
    }
  }, [editMode, product, urlProductId]);

  // Memoize initial values
  const initialValues = useMemo(() => ({
    title: (editMode && productData) ? productData.title : 
           (editMode && product) ? product.title : '',
    description: (editMode && productData) ? productData.description : 
                 (editMode && product) ? product.description : '',
    price: (editMode && productData) ? productData.price : 
           (editMode && product) ? product.price : '',
    category: (editMode && productData) ? productData.category : 
              (editMode && product) ? product.category : '',
    condition: (editMode && productData) ? productData.condition : 
               (editMode && product) ? product.condition : 'good',
    location: (editMode && productData) ? productData.location : 
              (editMode && product) ? product.location : '',
    tags: (editMode && productData) ? productData.tags : 
          (editMode && product) ? product.tags : [],
    isAvailable: (editMode && productData) ? productData.isAvailable : 
                 (editMode && product) ? product.isAvailable : true
  }), [editMode, product, productData]);

  // Validation schema
  const validationSchema = useMemo(() => 
    Yup.object({
      title: Yup.string()
        .required('Title is required')
        .min(3, 'Title should be at least 3 characters'),
      description: Yup.string()
        .required('Description is required')
        .min(10, 'Description should be at least 10 characters'),
      price: Yup.number()
        .required('Price is required')
        .positive('Price must be positive'),
      category: Yup.string()
        .required('Category is required'),
      condition: Yup.string()
        .required('Condition is required'),
      location: Yup.string()
        .required('Location is required'),
      tags: Yup.array()
        .min(1, 'Add at least one tag')
    }), []);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setErrorMessage('');
        setShowError(false);

        // Create a FormData object for file uploads
        const formData = new FormData();
        
        // Add all form fields to FormData
        Object.keys(values).forEach(key => {
          if (key === 'tags') {
            // Convert tags array to JSON string
            formData.append(key, JSON.stringify(values[key]));
          } else {
            formData.append(key, values[key]);
          }
        });
        
        // Add images to FormData
        imagesToUpload.forEach(file => {
          formData.append('images', file);
        });
        
        // Add keep_images parameter for edit mode
        if (editMode) {
          formData.append('keep_images', imagesToUpload.length === 0 ? 'true' : 'false');
        }

        let response;
        if (editMode) {
          // Get the product ID either from props or from the productData
          const productId = (product && product._id) || (productData && productData._id);
          
          if (!productId) {
            throw new Error('Product ID is missing for edit mode');
          }
          
          // Update existing product
          response = await axios.patch(`/api/products/${productId}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          setSuccessMessage('Product updated successfully!');
        } else {
          // Create new product
          response = await axios.post('/api/products', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          setSuccessMessage('Product listed successfully!');
        }

        setShowSuccess(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/products');
        }, 1500);
      } catch (error) {
        console.error('Product submission failed:', error);
        
        let message = 'Failed to submit product. Please try again.';
        if (error.response && error.response.data) {
          message = error.response.data.message || message;
        }
        
        setErrorMessage(message);
        setShowError(true);
      } finally {
        setLoading(false);
      }
    }
  });

  // Add another useEffect to update formik values when productData changes
  useEffect(() => {
    if (productData && formik) {
      // Directly set values for each field we need to update
      formik.setValues({
        title: productData.title || '',
        description: productData.description || '',
        price: productData.price || '',
        category: productData.category || '',
        condition: productData.condition || 'good',
        location: productData.location || '',
        tags: productData.tags || [],
        isAvailable: productData.isAvailable !== undefined ? productData.isAvailable : true
      }, false);
    }
  // Remove formik from dependency array to prevent infinite loops
  }, [productData]);

  // Handle adding tags
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    // Check if tag already exists
    if (formik.values.tags.includes(newTag.trim())) {
      setErrorMessage('Tag already added');
      setShowError(true);
      return;
    }
    
    const updatedTags = [...formik.values.tags, newTag.trim()];
    formik.setFieldValue('tags', updatedTags);
    setNewTag('');
  };

  // Handle removing tags
  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = formik.values.tags.filter(tag => tag !== tagToRemove);
    formik.setFieldValue('tags', updatedTags);
  };

  // Handle image file selection
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    // Check file types and sizes
    const validFiles = files.filter(file => {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Only image files are allowed');
        setShowError(true);
        return false;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size should be less than 5MB');
        setShowError(true);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Create preview URLs for the images
    const newImagePreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    // Update state
    setImagePreviewUrls([...imagePreviewUrls, ...newImagePreviewUrls]);
    setImagesToUpload([...imagesToUpload, ...validFiles]);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle removing images
  const handleRemoveImage = (index) => {
    // Create new arrays without the removed image
    const newPreviewUrls = [...imagePreviewUrls];
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);
    
    // Only remove from imagesToUpload if it's a new image
    if (index >= (editMode && product ? product.images.length : 0)) {
      const newImagesToUpload = [...imagesToUpload];
      const adjustedIndex = index - (editMode && product ? product.images.length : 0);
      newImagesToUpload.splice(adjustedIndex, 1);
      setImagesToUpload(newImagesToUpload);
    }
  };

  // Handle snackbar close
  const handleCloseError = () => {
    setShowError(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Only revoke the URLs we created, not the ones from the server
      const createdUrls = imagePreviewUrls.slice((editMode && product ? product.images.length : 0));
      createdUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls, editMode, product]);

  // Check if user is a seller or admin
  if (user?.role !== 'seller' && user?.role !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            Seller Registration Required
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            You need to be registered as a seller to list products. 
            Registration is quick and free!
          </Alert>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/profile')}
              startIcon={<Store />}
            >
              Go to Profile to Become a Seller
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={6} 
          sx={{ 
            p: { xs: 2, md: 4 }, 
            borderRadius: '16px'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ fontWeight: 'bold', color: theme.palette.primary.main, mb: 3 }}
          >
            {editMode ? 'Edit Product Listing' : 'Create New Product Listing'}
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="title"
                  name="title"
                  label="Product Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  margin="normal"
                  error={formik.touched.category && Boolean(formik.errors.category)}
                >
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    name="category"
                    value={formik.values.category}
                    label="Category"
                    onChange={formik.handleChange}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.category && formik.errors.category && (
                    <FormHelperText>{formik.errors.category}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  margin="normal"
                  error={formik.touched.condition && Boolean(formik.errors.condition)}
                >
                  <InputLabel id="condition-label">Condition</InputLabel>
                  <Select
                    labelId="condition-label"
                    id="condition"
                    name="condition"
                    value={formik.values.condition}
                    label="Condition"
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="like-new">Like New</MenuItem>
                    <MenuItem value="good">Good</MenuItem>
                    <MenuItem value="fair">Fair</MenuItem>
                    <MenuItem value="poor">Poor</MenuItem>
                  </Select>
                  {formik.touched.condition && formik.errors.condition && (
                    <FormHelperText>{formik.errors.condition}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="price"
                  name="price"
                  label="Price"
                  type="number"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  error={formik.touched.price && Boolean(formik.errors.price)}
                  helperText={formik.touched.price && formik.errors.price}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="location"
                  name="location"
                  label="Location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  error={formik.touched.location && Boolean(formik.errors.location)}
                  helperText={formik.touched.location && formik.errors.location}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      id="new-tag"
                      label="Add Tag"
                      variant="outlined"
                      size="small"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      sx={{ flexGrow: 1 }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={handleAddTag}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formik.values.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  {formik.touched.tags && formik.errors.tags && (
                    <FormHelperText error>{formik.errors.tags}</FormHelperText>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Images
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={<PhotoCamera />}
                      component="label"
                      color="primary"
                    >
                      Upload Images
                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                      />
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      Max 5 images, 5MB each. Supported formats: JPG, PNG, GIF
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {imagePreviewUrls.map((url, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            height: '120px',
                            overflow: 'hidden',
                            borderRadius: '8px',
                            border: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <img
                            src={url}
                            alt={`Product image ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            sx={{
                              position: 'absolute',
                              top: '5px',
                              right: '5px',
                              backgroundColor: 'rgba(255, 255, 255, 0.7)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              }
                            }}
                            onClick={() => handleRemoveImage(index)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading}
                >
                  {loading 
                    ? (editMode ? 'Updating Product...' : 'Creating Product...') 
                    : (editMode ? 'Update Product' : 'Create Product')}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </motion.div>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductForm; 