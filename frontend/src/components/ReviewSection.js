import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  Avatar,
  Paper,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { Person, Star, StarBorder } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const ReviewSection = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reviews/product/${productId}`);
      setReviews(response.data);
      
      // Check if current user has already reviewed this product
      if (user) {
        const hasReviewed = response.data.some(review => review.user._id === user._id);
        setUserHasReviewed(hasReviewed);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewDialog = () => {
    setOpenReviewDialog(true);
  };

  const handleCloseReviewDialog = () => {
    setOpenReviewDialog(false);
    setRating(0);
    setComment('');
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post('/api/reviews', {
        productId,
        rating,
        comment
      });
      
      // Close dialog and refresh reviews
      handleCloseReviewDialog();
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Reviews and Ratings
      </Typography>
      
      {/* Review summary */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', mr: 3 }}>
            <Typography variant="h4" component="span" color="primary" fontWeight="bold">
              {calculateAverageRating()}
            </Typography>
            <Typography variant="h6" component="span" color="text.secondary" sx={{ ml: 1 }}>
              / 5
            </Typography>
          </Box>
          
          <Rating 
            value={parseFloat(calculateAverageRating())} 
            precision={0.5} 
            readOnly
            sx={{ mr: 2 }}
          />
          
          <Typography variant="body2" color="text.secondary">
            ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
          </Typography>
        </Box>
        
        {!userHasReviewed && user && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleOpenReviewDialog}
            sx={{ mt: 1 }}
          >
            Write a Review
          </Button>
        )}
      </Paper>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Reviews list */}
      {reviews.length > 0 ? (
        <Grid container spacing={2}>
          {reviews.map((review) => (
            <Grid item xs={12} key={review._id}>
              <Paper sx={{ p: 3, borderRadius: '16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={review.user?.profileImage} 
                    sx={{ mr: 2 }}
                  >
                    {review.user?.name?.charAt(0) || <Person />}
                  </Avatar>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {review.user?.name || 'Anonymous'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating 
                        value={review.rating} 
                        size="small" 
                        readOnly 
                        sx={{ mr: 1 }}
                      />
                      
                      <Typography variant="body2" color="text.secondary">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Typography variant="body1">
                  {review.comment}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '16px' }}>
          <Typography variant="body1" color="text.secondary">
            No reviews yet. Be the first to review this product!
          </Typography>
          
          {user && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleOpenReviewDialog}
              sx={{ mt: 2 }}
            >
              Write a Review
            </Button>
          )}
        </Paper>
      )}
      
      {/* Review dialog */}
      <Dialog 
        open={openReviewDialog} 
        onClose={handleCloseReviewDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Write a Review</DialogTitle>
        
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Rate this product
            </Typography>
            
            <Rating
              name="rating"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              size="large"
              sx={{ mb: 3 }}
            />
            
            <TextField
              label="Your Review"
              multiline
              rows={4}
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              variant="outlined"
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseReviewDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitReview}
            disabled={submitting || rating === 0}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewSection; 