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
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Avatar
} from '@mui/material';
import axios from 'axios';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MessageIcon from '@mui/icons-material/Message';
import FlagIcon from '@mui/icons-material/Flag';
import { useNavigate } from 'react-router-dom';

// Helper function to safely capitalize the first letter of a string
const capitalizeFirstLetter = (string) => {
  if (!string) return 'Unknown';
  return string.charAt(0).toUpperCase() + string.slice(1);
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

// Helper function to get report ID safely
const getReportId = (report) => {
  if (!report) return null;
  return report._id || report.id;
};

// Helper function to get target ID safely
const getTargetId = (report) => {
  if (!report) return null;
  
  if (report.targetId) return report.targetId;
  
  if (report.targetType === 'product' && report.targetProduct) {
    return typeof report.targetProduct === 'string' ? report.targetProduct : report.targetProduct._id;
  }
  
  if (report.targetType === 'user' && report.targetUser) {
    return typeof report.targetUser === 'string' ? report.targetUser : report.targetUser._id;
  }
  
  if (report.targetType === 'message' && report.targetMessage) {
    return typeof report.targetMessage === 'string' ? report.targetMessage : report.targetMessage._id;
  }
  
  return null;
};

// Helper function to get the target type from a report
const getTargetType = (report) => {
  if (!report) return 'unknown';
  
  if (report.targetType) return report.targetType;
  
  if (report.targetProduct) return 'product';
  if (report.targetUser) return 'user';
  
  return 'other';
};

// Helper function to get type icon based on the target type
const getTypeIcon = (report) => {
  const targetType = typeof report === 'string' ? report : getTargetType(report);
  
  switch (targetType) {
    case 'product':
      return <ShoppingCartIcon fontSize="small" />;
    case 'user':
      return <PersonIcon fontSize="small" />;
    case 'other':
    case 'general':
      return <FlagIcon fontSize="small" />;
    default:
      return <FlagIcon fontSize="small" />;
  }
};

const AdminReportsList = () => {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalReports, setTotalReports] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [openProductDetailModal, setOpenProductDetailModal] = useState(false);
  const [productDetail, setProductDetail] = useState(null);
  const navigate = useNavigate();

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/reports?page=${page + 1}&limit=${rowsPerPage}`;
      
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      if (typeFilter) {
        url += `&targetType=${typeFilter}`;
      }
      
      if (reportTypeFilter) {
        url += `&reportType=${reportTypeFilter}`;
      }
      
      console.log('Fetching reports with URL:', url);
      
      const response = await axios.get(url);
      
      // Process the data to ensure we have the correct format
      const processedReports = response.data.reports.map(report => ({
        ...report,
        targetId: getTargetId(report)
      }));
      
      setReports(processedReports);
      setTotalReports(response.data.total);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch reports',
        severity: 'error'
      });
      setReports([]);
      setTotalReports(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, rowsPerPage, statusFilter, typeFilter, reportTypeFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenReviewDialog = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setAdminNotes(report.adminNotes || '');
    setOpenReviewDialog(true);
  };

  const handleCloseReviewDialog = () => {
    setOpenReviewDialog(false);
    setSelectedReport(null);
    setAdminNotes('');
  };

  const handleReportUpdate = async () => {
    if (!selectedReport) return;
    
    setActionLoading(true);
    try {
      const reportId = getReportId(selectedReport);
      
      if (!reportId) {
        throw new Error('Invalid report ID');
      }
      
      const response = await axios.patch('/api/admin/reports/status', {
        reportId: reportId,
        status: newStatus,
        adminNotes
      });
      
      // Close the dialog first
      handleCloseReviewDialog();
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Report updated successfully',
        severity: 'success'
      });
      
      // Refresh the reports list
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      
      // Show error message
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update report',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'investigating':
        return 'info';
      case 'resolved':
        return 'success';
      case 'dismissed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <WarningIcon fontSize="small" />;
      case 'investigating':
        return <HourglassEmptyIcon fontSize="small" />;
      case 'resolved':
        return <CheckCircleIcon fontSize="small" />;
      case 'dismissed':
        return <DeleteIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewTarget = (report) => {
    if (report.targetType === 'product') {
      navigate(`/products/${report.targetId}`);
    } else if (report.targetType === 'user') {
      // Navigate to user profile or admin user view
      // This would depend on your app structure
    } else if (report.targetType === 'general') {
      // General reports don't have a specific target to view
      return;
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenProductDetailModal = async (report) => {
    if (getTargetType(report) === 'product') {
      try {
        setActionLoading(true);
        // Get the correct target ID
        const targetId = getTargetId(report);
        
        if (!targetId) {
          throw new Error('Product ID not found');
        }
        
        // Try admin endpoint first, fallback to public if needed
        let response;
        try {
          response = await axios.get(`/api/admin/products/${targetId}`);
        } catch (err) {
          response = await axios.get(`/api/products/${targetId}`);
        }
        setProductDetail(response.data);
        setOpenProductDetailModal(true);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load product details',
          severity: 'error'
        });
        setProductDetail(null);
      } finally {
        setActionLoading(false);
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
        Reports Management
      </Typography>
      
      <Box sx={{ display: 'flex', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0); // Reset to first page when filter changes
            }}
            label="Status"
          >
            <MenuItem value="">
              <em>All Statuses</em>
            </MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="investigating">Investigating</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="dismissed">Dismissed</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="type-filter-label">Target Type</InputLabel>
          <Select
            labelId="type-filter-label"
            id="type-filter"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0); // Reset to first page when filter changes
            }}
            label="Target Type"
          >
            <MenuItem value="">
              <em>All Target Types</em>
            </MenuItem>
            <MenuItem value="product">Product</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="report-type-filter-label">Report Type</InputLabel>
          <Select
            labelId="report-type-filter-label"
            id="report-type-filter"
            value={reportTypeFilter}
            onChange={(e) => {
              setReportTypeFilter(e.target.value);
              setPage(0); // Reset to first page when filter changes
            }}
            label="Report Type"
          >
            <MenuItem value="">
              <em>All Report Types</em>
            </MenuItem>
            <MenuItem value="product">Product</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Target Type</TableCell>
              <TableCell>Report Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reported By</TableCell>
              <TableCell>Date Reported</TableCell>
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
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No reports found
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow 
                  key={report._id}
                  sx={{
                    backgroundColor: report.status === 'pending' ? 'rgba(255, 152, 0, 0.05)' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getTypeIcon(report)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {capitalizeFirstLetter(getTargetType(report))}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {capitalizeFirstLetter(report.reportType || 'Unknown')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={getStatusIcon(report.status)}
                      label={capitalizeFirstLetter(report.status)}
                      color={getStatusChipColor(report.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {report.reportedBy ? report.reportedBy.name : 'Anonymous'}
                  </TableCell>
                  <TableCell>{formatDate(report.createdAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {getTargetType(report) === 'product' && getTargetId(report) && (
                        <Tooltip title="View Reported Item">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenProductDetailModal(report)}
                            color="primary"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        color={report.status === 'pending' ? 'warning' : 'primary'}
                        onClick={() => handleOpenReviewDialog(report)}
                      >
                        Review
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
          count={totalReports}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Review Report Dialog */}
      <Dialog 
        open={openReviewDialog} 
        onClose={actionLoading ? undefined : handleCloseReviewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Review Report
          {selectedReport && (
            <Typography variant="subtitle2" color="textSecondary">
              ID: {selectedReport._id}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedReport ? (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Report Details
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Target Type:</strong> {capitalizeFirstLetter(getTargetType(selectedReport))}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Report Type:</strong> {capitalizeFirstLetter(selectedReport.reportType || 'Unknown')}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Reported By:</strong> {selectedReport.reportedBy ? selectedReport.reportedBy.name : 'Anonymous'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Date:</strong> {formatDate(selectedReport.createdAt)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Description:</strong>
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                  <Typography variant="body2">
                    {selectedReport.description || selectedReport.details || 'No description provided'}
                  </Typography>
                </Paper>
              </Box>

              <DialogContentText>
                Update the status of this report and add admin notes.
              </DialogContentText>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="update-status-label">Status</InputLabel>
                <Select
                  labelId="update-status-label"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Status"
                  disabled={actionLoading}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="investigating">Investigating</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="dismissed">Dismissed</MenuItem>
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                id="admin-notes"
                label="Admin Notes"
                type="text"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                disabled={actionLoading}
                sx={{ mt: 2 }}
              />
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog} disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleReportUpdate} 
            variant="contained" 
            color="primary"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Updating...
              </>
            ) : 'Update Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Detail Modal for Reported Items */}
      <Dialog 
        open={openProductDetailModal} 
        onClose={handleCloseProductDetailModal} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Reported Product Details</DialogTitle>
        <DialogContent dividers>
          {actionLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : productDetail ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {productDetail.images && productDetail.images.length > 0 ? (
                  <Avatar 
                    src={getFullImageUrl(productDetail.images[0])} 
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
            <Typography color="error">No product details available or product not found.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDetailModal} color="primary">Close</Button>
          {productDetail && (
            <Button 
              color="primary" 
              variant="contained"
              onClick={() => {
                handleCloseProductDetailModal();
                navigate(`/products/${productDetail._id}`);
              }}
            >
              View Full Details
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminReportsList; 