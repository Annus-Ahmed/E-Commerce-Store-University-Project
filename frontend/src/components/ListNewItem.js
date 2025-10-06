import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Grid,
    MenuItem,
    InputAdornment,
    Alert
} from '@mui/material';
import { PhotoCamera, AttachMoney } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports',
    'Books',
    'Toys',
    'Other'
];

const validationSchema = Yup.object({
    title: Yup.string()
        .required('Title is required')
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must not exceed 100 characters'),
    description: Yup.string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must not exceed 1000 characters'),
    price: Yup.number()
        .required('Price is required')
        .min(0, 'Price must be positive'),
    category: Yup.string()
        .required('Category is required'),
    condition: Yup.string()
        .required('Condition is required'),
    images: Yup.array()
        .min(1, 'At least one image is required')
        .max(5, 'Maximum 5 images allowed')
});

const ListNewItem = ({ onSubmit }) => {
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            price: '',
            category: '',
            condition: 'New',
            images: []
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const formData = new FormData();
                Object.keys(values).forEach(key => {
                    if (key === 'images') {
                        values[key].forEach(image => {
                            formData.append('images', image);
                        });
                    } else {
                        formData.append(key, values[key]);
                    }
                });

                await onSubmit(formData);
                formik.resetForm();
                setImages([]);
            } catch (err) {
                setError(err.message || 'Error creating listing');
            }
        }
    });

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length + images.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }
        setImages([...images, ...files]);
        formik.setFieldValue('images', [...images, ...files]);
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                List New Item
            </Typography>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            name="title"
                            label="Title"
                            value={formik.values.title}
                            onChange={formik.handleChange}
                            error={formik.touched.title && Boolean(formik.errors.title)}
                            helperText={formik.touched.title && formik.errors.title}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            name="description"
                            label="Description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            error={formik.touched.description && Boolean(formik.errors.description)}
                            helperText={formik.touched.description && formik.errors.description}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            name="price"
                            label="Price"
                            type="number"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AttachMoney />
                                    </InputAdornment>
                                ),
                            }}
                            value={formik.values.price}
                            onChange={formik.handleChange}
                            error={formik.touched.price && Boolean(formik.errors.price)}
                            helperText={formik.touched.price && formik.errors.price}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            name="category"
                            label="Category"
                            value={formik.values.category}
                            onChange={formik.handleChange}
                            error={formik.touched.category && Boolean(formik.errors.category)}
                            helperText={formik.touched.category && formik.errors.category}
                        >
                            {categories.map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            name="condition"
                            label="Condition"
                            value={formik.values.condition}
                            onChange={formik.handleChange}
                            error={formik.touched.condition && Boolean(formik.errors.condition)}
                            helperText={formik.touched.condition && formik.errors.condition}
                        >
                            <MenuItem value="New">New</MenuItem>
                            <MenuItem value="Like New">Like New</MenuItem>
                            <MenuItem value="Good">Good</MenuItem>
                            <MenuItem value="Fair">Fair</MenuItem>
                            <MenuItem value="Poor">Poor</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<PhotoCamera />}
                            sx={{ mb: 2 }}
                        >
                            Upload Images
                            <input
                                type="file"
                                hidden
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </Button>
                        <Typography variant="body2" color="textSecondary">
                            {images.length} images selected (max 5)
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                            disabled={formik.isSubmitting}
                        >
                            List Item
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default ListNewItem; 