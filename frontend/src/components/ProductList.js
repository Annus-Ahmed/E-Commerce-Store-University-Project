import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  TextField,
  Typography,
  Skeleton,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton,
  OutlinedInput,
  Slider,
  Tooltip,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormGroup,
  FormControlLabel,
  InputAdornment,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import { 
  Search, 
  FilterList, 
  Sort, 
  Clear, 
  Save, 
  Bookmark, 
  BookmarkBorder,
  LocationOn,
  LocalOffer,
  Category,
  AttachMoney,
  Close,
  Tune,
  CheckCircle,
  CheckBoxOutlineBlank,
  CheckBox,
  Refresh,
  Add,
  InfoOutlined
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import UI components
import PageHeader from './ui/PageHeader';
import ProductCard from './ui/ProductCard';
import SectionContainer from './ui/SectionContainer';
import EmptyState from './ui/EmptyState';
import LoadingScreen from './ui/LoadingScreen';

// Helper function to get full image URL
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

// Helper function to get condition color
const getConditionColor = (condition) => {
  switch (condition?.toLowerCase()) {
    case 'new':
      return 'success';
    case 'like new':
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

const ProductList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State variables
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Reference data
  const [categories, setCategories] = useState(['electronics', 'furniture', 'clothing', 'books', 'toys', 'sports', 'automotive', 'other']);
  const [popularTags, setPopularTags] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  
  // Search and Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [locationFilter, setLocationFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFilterDrawer, setMobileFilterDrawer] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // Saved filter presets
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterPresetName, setFilterPresetName] = useState('');
  const [showSavedFilters, setShowSavedFilters] = useState(false);

  // Products with similar feature
  const [similarProductId, setSimilarProductId] = useState(null);
  
  // Set up query parameters from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    if (params.has('search')) setSearchTerm(params.get('search'));
    if (params.has('category')) {
      const cats = params.getAll('category');
      setSelectedCategories(cats);
    }
    if (params.has('condition')) {
      const conditions = params.getAll('condition');
      setSelectedConditions(conditions);
    }
    if (params.has('minPrice') && params.has('maxPrice')) {
      setPriceRange([Number(params.get('minPrice')), Number(params.get('maxPrice'))]);
    }
    if (params.has('location')) setLocationFilter(params.get('location'));
    if (params.has('sort')) setSortOption(params.get('sort'));
    if (params.has('available')) setAvailableOnly(params.get('available') === 'true');
    
    // Handle similar products
    if (params.has('similar')) {
      const productId = params.get('similar');
      setSimilarProductId(productId);
      
      // Load similar products if we have an ID
      if (productId) {
        const loadSimilarProducts = async () => {
          try {
            setLoading(true);
            const response = await axios.get(`/api/products/similar/${productId}`);
            
            // Process images with the helper function
            const processedProducts = response.data.map(product => ({
              ...product,
              images: product.images.map(image => getFullImageUrl(image))
            }));
            
            setProducts(processedProducts);
            setError(null);
            setInitialLoadComplete(true);
          } catch (error) {
            console.error('Error loading similar products:', error);
            setError('Failed to load similar products. Please try again.');
            setProducts([]);
            setInitialLoadComplete(true);
          } finally {
            setLoading(false);
          }
        };
        
        loadSimilarProducts();
      }
    } else {
      // If not viewing similar products, set up normal reference data
      fetchReferenceData();
      // Set initial load complete after a short delay
      setTimeout(() => {
        setInitialLoadComplete(true);
      }, 100);
    }
  }, [location.search]);
  
  // Fetch reference data (categories, popular tags, locations)
  const fetchReferenceData = async () => {
    try {
      // Fetch popular tags
      const tagsResponse = await axios.get('/api/products/tags/popular');
      setPopularTags(tagsResponse.data);
      
      // Extract unique locations from all products (this should be moved to a dedicated endpoint)
      const productsResponse = await axios.get('/api/products');
      
      // Process the products to ensure image URLs are correct
      const processedProducts = productsResponse.data.map(product => ({
        ...product,
        images: product.images.map(image => getFullImageUrl(image))
      }));
      
      const uniqueLocations = [...new Set(processedProducts
        .map(product => product.location)
        .filter(Boolean))];
      
      setLocations(uniqueLocations);
      setProducts(processedProducts); // Set initial products list
      setAllProducts(processedProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reference data:', error);
      setError('Failed to load products. Please try again.');
      setLoading(false);
    }
  };
  
  // Load saved filters from localStorage
  useEffect(() => {
    const savedFiltersJson = localStorage.getItem('savedFilters');
    if (savedFiltersJson) {
      try {
        setSavedFilters(JSON.parse(savedFiltersJson));
      } catch (e) {
        console.error('Error parsing saved filters:', e);
      }
    }
  }, []);

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategories.length > 0) count++;
    if (selectedConditions.length > 0) count++;
    if (selectedTags.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count++;
    if (locationFilter) count++;
    if (availableOnly) count++;
    if (sortOption !== 'newest') count++;
    
    setActiveFiltersCount(count);
  }, [
    searchTerm, selectedCategories, selectedConditions, selectedTags, 
    priceRange, locationFilter, availableOnly, sortOption
  ]);

  // Fetch products with applied filters
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Build query string with all active filters
      let queryParams = new URLSearchParams();
      
      if (searchTerm) queryParams.append('search', searchTerm);
      
      if (selectedCategories.length > 0) {
        selectedCategories.forEach(category => {
          queryParams.append('category', category);
        });
      }
      
      if (selectedConditions.length > 0) {
        selectedConditions.forEach(condition => {
          queryParams.append('condition', condition);
        });
      }
      
      if (selectedTags.length > 0) {
        selectedTags.forEach(tag => {
          queryParams.append('tags', tag);
        });
      }
      
      if (priceRange[0] > 0) queryParams.append('minPrice', priceRange[0]);
      if (priceRange[1] < 10000) queryParams.append('maxPrice', priceRange[1]);
      
      if (locationFilter) queryParams.append('location', locationFilter);
      
      if (availableOnly) queryParams.append('isAvailable', true);
      
      queryParams.append('sort', sortOption);
      
      // Make API request
      const response = await axios.get(`/api/products?${queryParams.toString()}`);
      
      // Process products to ensure image URLs are complete
      const processedProducts = response.data.map(product => ({
        ...product,
        images: product.images.map(image => getFullImageUrl(image))
      }));
      
      setProducts(processedProducts);
      setPage(1); // Reset to first page on new filter
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Call fetchProducts when filters change
  useEffect(() => {
    if (!initialLoadComplete) return;

    if (similarProductId) {
      setSimilarProductId(null);
    }

    // Use a debounce to prevent multiple rapid API calls
    const timer = setTimeout(() => {
      fetchProducts();
      
      // Update URL with current filters (without reloading the page)
      const params = new URLSearchParams();
  
      if (searchTerm) params.append('search', searchTerm);
      selectedCategories.forEach(cat => params.append('category', cat));
      selectedConditions.forEach(cond => params.append('condition', cond));
      if (priceRange[0] > 0) params.append('minPrice', priceRange[0]);
      if (priceRange[1] < 10000) params.append('maxPrice', priceRange[1]);
      if (locationFilter) params.append('location', locationFilter);
      selectedTags.forEach(tag => params.append('tags', tag));
      if (availableOnly) params.append('isAvailable', 'true');
      params.append('sort', sortOption);
  
      navigate({
        pathname: location.pathname,
        search: params.toString()
      }, { replace: true });
    }, 500); // 500ms debounce

    // Cleanup timeout on component unmount or when deps change
    return () => clearTimeout(timer);
  }, [
    searchTerm, selectedCategories, selectedConditions, selectedTags,
    priceRange, locationFilter, availableOnly, sortOption,
    initialLoadComplete, similarProductId
  ]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle category selection change
  const handleCategoryChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedCategories(
      typeof value === 'string' ? value.split(',') : value,
    );
  };
  
  // Handle condition selection change
  const handleConditionChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedConditions(
      typeof value === 'string' ? value.split(',') : value,
    );
  };
  
  // Handle tag selection change
  const handleTagsChange = (event, newValue) => {
    setSelectedTags(newValue);
  };
  
  // Handle price range change
  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };
  
  // Handle price range change when the user stops dragging
  const handlePriceRangeChangeCommitted = (event, newValue) => {
    setPriceRange(newValue);
    fetchProducts();
  };
  
  // Handle location change
  const handleLocationChange = (event, newValue) => {
    setLocationFilter(newValue || '');
  };
  
  // Handle sort option change
  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };
  
  // Handle page change for pagination
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedConditions([]);
    setSelectedTags([]);
    setPriceRange([0, 10000]);
    setLocationFilter('');
    setAvailableOnly(false);
    setSortOption('newest');
    setSimilarProductId(null);
  };
  
  // Toggle filter drawer for mobile
  const toggleFilterDrawer = (open) => () => {
    setMobileFilterDrawer(open);
  };
  
  // Save current filter as preset
  const saveFilterPreset = () => {
    if (!filterPresetName.trim()) return;
    
    const newPreset = {
      id: Date.now().toString(),
      name: filterPresetName,
      filters: {
        searchTerm,
        selectedCategories,
        selectedConditions,
        selectedTags,
        priceRange,
        locationFilter,
        availableOnly,
        sortOption
      }
    };
    
    const updatedPresets = [...savedFilters, newPreset];
    setSavedFilters(updatedPresets);
    localStorage.setItem('savedFilters', JSON.stringify(updatedPresets));
    setFilterPresetName('');
  };
  
  // Apply a saved filter preset
  const applyFilterPreset = (preset) => {
    const { filters } = preset;
    setSearchTerm(filters.searchTerm || '');
    setSelectedCategories(filters.selectedCategories || []);
    setSelectedConditions(filters.selectedConditions || []);
    setSelectedTags(filters.selectedTags || []);
    setPriceRange(filters.priceRange || [0, 10000]);
    setLocationFilter(filters.locationFilter || '');
    setAvailableOnly(filters.availableOnly || false);
    setSortOption(filters.sortOption || 'newest');
    setShowSavedFilters(false);
  };
  
  // Delete a saved filter preset
  const deleteFilterPreset = (id) => {
    const updatedPresets = savedFilters.filter(preset => preset.id !== id);
    setSavedFilters(updatedPresets);
    localStorage.setItem('savedFilters', JSON.stringify(updatedPresets));
  };

  // Find similar products
  const findSimilarProducts = async (product) => {
    try {
      setLoading(true);
      // Call the backend endpoint to get similar products
      const response = await axios.get(`/api/products/similar/${product._id}`);
      
      // Process the similar products to ensure image URLs are complete
      const processedProducts = response.data.map(product => ({
        ...product,
        images: product.images.map(image => getFullImageUrl(image))
      }));
      
      setProducts(processedProducts);
      setSimilarProductId(product._id);
      
      // Update URL to indicate we're viewing similar products
      navigate({
        pathname: location.pathname,
        search: `?similar=${product._id}`
      }, { replace: true });
      
      // Reset page to 1
      setPage(1);
      setError(null);
    } catch (error) {
      console.error('Error finding similar products:', error);
      setError('Failed to find similar products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate proper pagination values
  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  }, [products, page, itemsPerPage]);
  
  // Calculate total pages
  const totalPages = useMemo(() => 
    Math.ceil(products.length / itemsPerPage), 
    [products, itemsPerPage]
  );

  return (
    <Box>
      <PageHeader
        title="Browse Products"
        subtitle="Discover great deals on pre-owned items" 
        action={
          <Button
            component={Link}
            to="/list-item"
            variant="contained"
            color="primary"
            startIcon={<Add />}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            List New Item
          </Button>
        }
      />
      
      <SectionContainer 
        elevation={0}
        sx={{ mb: 4 }}
      >
        {/* Search and filter bar */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 2,
          mb: 3
        }}>
          <TextField
            fullWidth
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
            variant="outlined"
            size="small"
          />
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            width: { xs: '100%', md: 'auto' }
          }}>
            <Button
              variant={activeFiltersCount > 0 ? "contained" : "outlined"}
              color="primary"
              startIcon={<Tune />}
              onClick={toggleFilterDrawer(true)}
              sx={{ 
                minWidth: { sm: '120px' },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              <Box component="span" sx={{ mr: 0.5 }}>Filters</Box>
              {activeFiltersCount > 0 && (
                <Chip 
                  label={activeFiltersCount} 
                  color={activeFiltersCount > 0 ? "secondary" : "primary"}
                  size="small"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.75rem',
                    bgcolor: activeFiltersCount > 0 ? 'secondary.main' : undefined
                  }}
                />
              )}
            </Button>
          </Box>
        </Box>
        
        {/* Active filters */}
        {activeFiltersCount > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {selectedCategories.map(category => (
              <Chip
                key={category}
                label={`Category: ${category}`}
                onDelete={() => handleCategoryChange({ target: { value: selectedCategories.filter(c => c !== category) } })}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
            
            {selectedConditions.map(condition => (
              <Chip
                key={condition}
                label={`Condition: ${condition}`}
                onDelete={() => handleConditionChange({ target: { value: selectedConditions.filter(c => c !== condition) } })}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
            
            {selectedTags.map(tag => (
              <Chip
                key={tag}
                label={`Tag: ${tag}`}
                onDelete={() => handleTagsChange(null, selectedTags.filter(t => t !== tag))}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
            
            {(priceRange[0] > 0 || priceRange[1] < 10000) && (
              <Chip
                label={`Price: $${priceRange[0]} - $${priceRange[1]}`}
                onDelete={() => setPriceRange([0, 10000])}
                size="small"
                variant="outlined"
                color="primary"
              />
            )}
            
            {locationFilter && (
              <Chip
                label={`Location: ${locationFilter}`}
                onDelete={() => setLocationFilter('')}
                size="small"
                variant="outlined"
                color="primary"
              />
            )}
            
            {availableOnly && (
              <Chip
                label="Available Only"
                onDelete={() => setAvailableOnly(false)}
                size="small"
                variant="outlined"
                color="primary"
              />
            )}
            
            <Chip
              label="Clear All"
              onClick={clearFilters}
              size="small"
              color="secondary"
            />
          </Box>
        )}
        
        {/* Products grid */}
        {loading ? (
          <Grid container spacing={3}>
            {Array.from(new Array(8)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <ProductCard loading={true} />
              </Grid>
            ))}
          </Grid>
        ) : products.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={3}>
              {paginatedProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <ProductCard
                      product={{
                        ...product,
                        condition: product.condition || 'Good',
                        isAvailable: product.isAvailable === undefined ? true : product.isAvailable,
                        rating: product.averageRating || 0,
                        reviewCount: product.reviewCount || 0
                      }}
                      onAddToWishlist={() => {}}
                      onAddToCart={() => {}}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        ) : (
          <EmptyState
            type="search"
            title="No Products Found"
            message={`We couldn't find any products matching your criteria. ${
              activeFiltersCount > 0 ? 'Try removing some filters.' : 'Try a different search term.'
            }`}
            action={activeFiltersCount > 0}
            actionText="Clear Filters"
            onAction={clearFilters}
          />
        )}
        
        {/* Pagination */}
        {!loading && products.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? 'small' : 'medium'}
              showFirstButton 
              showLastButton
            />
          </Box>
        )}
      </SectionContainer>
      
      {/* Mobile add item button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          display: { xs: 'block', sm: 'none' }
        }}
      >
        <Button
          component={Link}
          to="/list-item"
          variant="contained"
          color="primary"
          sx={{ 
            borderRadius: '50%', 
            minWidth: 56, 
            height: 56,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          <Add />
        </Button>
      </Box>

      {/* Filter drawer */}
      <Drawer
        anchor="right"
        open={mobileFilterDrawer}
        onClose={toggleFilterDrawer(false)}
        PaperProps={{ sx: { width: { xs: '100vw', sm: 360 }, p: 3 } }}
      >
        <Box sx={{ p: 2, width: '100%' }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Divider sx={{ mb: 2 }} />
          {/* Categories */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              multiple
              value={selectedCategories}
              onChange={handleCategoryChange}
              label="Category"
              renderValue={(selected) => selected.join(', ')}
              startAdornment={<Category sx={{ color: 'primary.main', mr: 1, ml: -0.5 }} />}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat} sx={{ textTransform: 'capitalize' }}>
                  <Checkbox 
                    checked={selectedCategories.indexOf(cat) > -1} 
                    color="primary"
                  />
                  <ListItemText primary={cat} primaryTypographyProps={{ sx: { textTransform: 'capitalize' } }} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Condition */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="condition-label">Condition</InputLabel>
            <Select
              labelId="condition-label"
              multiple
              value={selectedConditions}
              onChange={handleConditionChange}
              label="Condition"
              renderValue={(selected) => selected.join(', ')}
              startAdornment={<CheckCircle sx={{ color: 'primary.main', mr: 1, ml: -0.5 }} />}
            >
              {['New', 'Like New', 'Good', 'Fair', 'Poor'].map((cond) => (
                <MenuItem key={cond} value={cond}>
                  <Checkbox 
                    checked={selectedConditions.indexOf(cond) > -1} 
                    color={getConditionColor(cond.toLowerCase())}
                  />
                  <ListItemText primary={cond} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Price Range */}
          <Box sx={{ mb: 2 }}>
            <Typography gutterBottom>Price Range ($)</Typography>
            <Slider
              value={priceRange}
              onChange={handlePriceRangeChange}
              onChangeCommitted={handlePriceRangeChangeCommitted}
              valueLabelDisplay="auto"
              min={0}
              max={10000}
              step={10}
              marks={[
                { value: 0, label: '$0' },
                { value: 2500, label: '$2.5K' },
                { value: 5000, label: '$5K' },
                { value: 7500, label: '$7.5K' },
                { value: 10000, label: '$10K' }
              ]}
            />
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 1
            }}>
              <Typography variant="body2" color="text.secondary">
                ${priceRange[0]}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${priceRange[1]}
              </Typography>
            </Box>
          </Box>
          {/* Location */}
          <Autocomplete
            options={locations}
            value={locationFilter}
            onChange={handleLocationChange}
            renderInput={(params) => (
              <TextField {...params} label="Location" variant="outlined" sx={{ mb: 2 }} />
            )}
            freeSolo
          />
          {/* Tags */}
          <Autocomplete
            multiple
            options={popularTags}
            value={selectedTags}
            onChange={handleTagsChange}
            renderInput={(params) => (
              <TextField {...params} label="Tags" variant="outlined" sx={{ mb: 2 }} />
            )}
            freeSolo
          />
          {/* Available Only */}
          <Box sx={{ 
            mb: 2, 
            p: 1.5, 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: availableOnly ? 'action.hover' : 'transparent'
          }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={availableOnly}
                  onChange={(e) => {
                    setAvailableOnly(e.target.checked);
                  }}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: availableOnly ? 'bold' : 'regular' }}>
                    Available Only
                  </Typography>
                  <Tooltip title="Show only items that are currently available for purchase">
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <InfoOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
              sx={{ m: 0 }}
            />
          </Box>
          {/* Drawer Actions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
              onClick={() => {
                fetchProducts();
                toggleFilterDrawer(false)();
              }}
              sx={{ py: 1.2 }}
              disabled={loading}
            >
              {loading ? 'Applying...' : 'Apply Filters'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              startIcon={<Clear />}
              onClick={() => {
                clearFilters();
                toggleFilterDrawer(false)();
              }}
              sx={{ py: 1.2 }}
              disabled={loading}
            >
              Clear All
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default ProductList; 