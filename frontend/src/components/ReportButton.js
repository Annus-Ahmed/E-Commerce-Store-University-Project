import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import ReportIcon from '@mui/icons-material/Report';
import axios from 'axios';

const ReportButton = ({ targetId, targetType, buttonText, iconOnly = false, color = "default" }) => {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setReportType('');
    setDescription('');
  };

  const handleSubmit = async () => {
    if (!reportType || !description || description.length < 10) {
      setSnackbar({
        open: true,
        message: 'Please provide a report type and detailed description (minimum 10 characters)',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/reports', {
        reportType: targetType,
        reason: reportType,
        details: description,
        targetId: targetId,
        targetType: targetType
      });

      setSnackbar({
        open: true,
        message: 'Report submitted successfully. Our team will review it shortly.',
        severity: 'success'
      });
      handleClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit report. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      {iconOnly ? (
        <Tooltip title={buttonText || "Report"}>
          <IconButton onClick={handleClickOpen} color={color} size="small">
            <ReportIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          startIcon={<ReportIcon />}
          onClick={handleClickOpen}
          color={color}
          variant="outlined"
          size="small"
        >
          {buttonText || "Report"}
        </Button>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Report {targetType.charAt(0).toUpperCase() + targetType.slice(1)}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please provide details about why you are reporting this {targetType}. Your report will be reviewed by our moderation team.
          </DialogContentText>
          <FormControl fullWidth margin="dense">
            <InputLabel id="report-type-label">Reason for Report</InputLabel>
            <Select
              labelId="report-type-label"
              id="report-type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              label="Reason for Report"
              required
            >
              <MenuItem value="fake">Counterfeit/Fake Item</MenuItem>
              <MenuItem value="offensive">Offensive/Harmful</MenuItem>
              <MenuItem value="prohibited">Prohibited Item</MenuItem>
              <MenuItem value="spam">Spam</MenuItem>
              <MenuItem value="inappropriate">Inappropriate Content</MenuItem>
              <MenuItem value="fraud">Fraudulent Activity</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            id="description"
            label="Description"
            type="text"
            fullWidth
            required
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={description.length > 0 && description.length < 10}
            helperText={description.length > 0 && description.length < 10 
              ? "Please provide at least 10 characters" 
              : "Please provide specific details to help our team review the report"}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary" 
            disabled={loading || !reportType || description.length < 10}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Report'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ReportButton; 