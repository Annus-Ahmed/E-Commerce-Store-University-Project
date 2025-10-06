import React, { useState, useEffect, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Link,
    Grid,
    useTheme,
    useMediaQuery,
    Alert,
    Snackbar,
    CircularProgress,
    InputAdornment,
    Stepper,
    Step,
    StepLabel,
    Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    PersonAdd,
    Email,
    Lock,
    Person,
    Phone,
    Home,
    LocationCity,
    Public,
    MarkunreadMailbox
} from '@mui/icons-material';

const Register = () => {
    const { register, error: authError } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    const steps = ['Account Information', 'Personal Details'];

    // Use effect to handle auth context errors instead of in render
    useEffect(() => {
        if (authError) {
            setErrorMessage(authError);
            setShowError(true);
        }
    }, [authError]);

    // Memoize validation schema to prevent recreation on each render
    const validationSchema = useMemo(() => 
        Yup.object({
            name: Yup.string()
                .required('Full name is required')
                .min(2, 'Name must be at least 2 characters'),
            email: Yup.string()
                .email('Invalid email address')
                .required('Email is required'),
            password: Yup.string()
                .required('Password is required')
                .min(6, 'Password must be at least 6 characters'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                .required('Confirm password is required'),
            phone: Yup.string()
                .matches(/^[0-9+\-\s()]*$/, 'Invalid phone number'),
            street: Yup.string(),
            city: Yup.string(),
            state: Yup.string(),
            zipCode: Yup.string(),
            country: Yup.string()
        }), []);

    // Memoize initial values
    const initialValues = useMemo(() => ({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
    }), []);

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                setErrorMessage('');
                setShowError(false);
                
                // Create the payload for registration with the correct format
                const userData = {
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    phone: values.phone,
                    address: {
                        street: values.street,
                        city: values.city,
                        state: values.state,
                        zipCode: values.zipCode,
                        country: values.country
                    }
                };
                
                console.log('Submitting registration with values:', userData);
                
                // Register the user
                await register(userData);
                
                // Navigate to products page after successful registration
                navigate('/products');
            } catch (error) {
                console.error('Registration failed:', error);
                
                // Display error message to user
                let message = 'Registration failed. Please try again.';
                if (error.response && error.response.data) {
                    message = error.response.data.message || message;
                    console.log('Server error details:', error.response.data);
                } else if (error.message) {
                    message = error.message;
                }
                
                setErrorMessage(message);
                setShowError(true);
                setActiveStep(0); // Return to first step on error
            } finally {
                setLoading(false);
            }
        }
    });

    const handleCloseError = () => {
        setShowError(false);
    };

    const handleNext = () => {
        const step1Fields = ['name', 'email', 'password', 'confirmPassword'];
        
        // Check if current step fields are valid before proceeding
        if (activeStep === 0) {
            const hasErrors = step1Fields.some(field => 
                formik.touched[field] && formik.errors[field]
            );
            
            // Touch all fields in this step to show errors
            step1Fields.forEach(field => {
                if (!formik.touched[field]) {
                    formik.setFieldTouched(field, true, false);
                }
            });
            
            if (hasErrors || !step1Fields.every(field => formik.values[field])) {
                return; // Don't proceed if there are errors
            }
        }
        
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <>
                        <TextField
                            margin="normal"
                            fullWidth
                            id="name"
                            label="Full Name"
                            name="name"
                            autoComplete="name"
                            autoFocus
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            id="confirmPassword"
                            autoComplete="new-password"
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            disabled={loading}
                        />
                    </>
                );
            case 1:
                return (
                    <>
                        <TextField
                            margin="normal"
                            fullWidth
                            id="phone"
                            label="Phone Number (Optional)"
                            name="phone"
                            autoComplete="tel"
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.phone && Boolean(formik.errors.phone)}
                            helperText={formik.touched.phone && formik.errors.phone}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Phone color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            disabled={loading}
                        />
                        
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                            Address (Optional)
                        </Typography>
                        
                        <TextField
                            margin="normal"
                            fullWidth
                            id="street"
                            label="Street Address"
                            name="street"
                            value={formik.values.street}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Home color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            disabled={loading}
                        />
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="city"
                                    label="City"
                                    name="city"
                                    value={formik.values.city}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationCity color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="state"
                                    label="State/Province"
                                    name="state"
                                    value={formik.values.state}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={loading}
                                />
                            </Grid>
                        </Grid>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="zipCode"
                                    label="Zip/Postal Code"
                                    name="zipCode"
                                    value={formik.values.zipCode}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <MarkunreadMailbox color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="country"
                                    label="Country"
                                    name="country"
                                    value={formik.values.country}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Public color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    disabled={loading}
                                />
                            </Grid>
                        </Grid>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 8 } }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: { xs: 3, sm: 5 }, 
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                >
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                            Create Account
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Join our marketplace community
                        </Typography>
                    </Box>

                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    <Snackbar 
                        open={showError} 
                        autoHideDuration={6000} 
                        onClose={handleCloseError}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Alert 
                            onClose={handleCloseError} 
                            severity="error" 
                            sx={{ width: '100%' }}
                        >
                            {errorMessage}
                        </Alert>
                    </Snackbar>

                    <Box component="form" noValidate>
                        {renderStepContent(activeStep)}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                variant="outlined"
                                disabled={activeStep === 0 || loading}
                                onClick={handleBack}
                                sx={{ minWidth: 100 }}
                            >
                                Back
                            </Button>
                            
                            {activeStep === steps.length - 1 ? (
                                <Button
                                    variant="contained"
                                    disabled={loading}
                                    onClick={formik.handleSubmit}
                                    sx={{ minWidth: 100 }}
                                >
                                    {loading ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        'Register'
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    sx={{ minWidth: 100 }}
                                >
                                    Next
                                </Button>
                            )}
                        </Box>
                        
                        <Divider sx={{ my: 3 }} />
                        
                        <Grid container justifyContent="center">
                            <Grid item>
                                <Link component={RouterLink} to="/login" variant="body2">
                                    {"Already have an account? Sign In"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default Register; 