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
    InputAdornment,
    IconButton,
    CircularProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';

const Login = () => {
    const { login, error: authError } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
            email: Yup.string()
                .email('Invalid email address')
                .required('Email is required'),
            password: Yup.string()
                .required('Password is required')
        }), []);

    // Memoize initial values
    const initialValues = useMemo(() => ({
        email: '',
        password: ''
    }), []);

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                setErrorMessage('');
                setShowError(false);
                
                console.log('Attempting login with:', values.email);
                
                // Login the user using auth context
                const user = await login(values.email, values.password);
                
                // Handle redirection based on user role
                if (user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/products');
                }
            } catch (error) {
                console.error('Login failed:', error);
                
                // Set error message to display to user
                let message = 'Login failed. Please check your credentials and try again.';
                
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

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleCloseError = () => {
        setShowError(false);
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
                            Welcome Back
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Sign in to continue to the marketplace
                        </Typography>
                    </Box>

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

                    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
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
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
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
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={toggleShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.2 }}
                            disabled={loading}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                        <Grid container justifyContent="space-between">
                            <Grid item>
                                <Link component={RouterLink} to="#" variant="body2">
                                    Forgot password?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link component={RouterLink} to="/register" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default Login; 