import React from 'react';
import {
  TextField,
  InputAdornment,
  FormHelperText,
  Box,
  Typography,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';

const FormInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  helperText,
  startIcon,
  endIcon,
  disabled = false,
  required = false,
  autoFocus = false,
  placeholder,
  fullWidth = true,
  multiline = false,
  rows = 1,
  variant = 'outlined',
  margin = 'normal',
  animation = true,
  animationDelay = 0,
  size = 'medium',
  color = 'primary',
  description,
  sx = {},
  ...props
}) => {
  const theme = useTheme();

  const inputContent = (
    <Box sx={{ mb: 1.5, ...sx }}>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 0.5, ml: 0.5 }}
        >
          {description}
        </Typography>
      )}
      <TextField
        id={id}
        name={id}
        label={label}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={Boolean(error)}
        helperText={error || helperText}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        placeholder={placeholder}
        fullWidth={fullWidth}
        multiline={multiline}
        rows={rows}
        variant={variant}
        margin={margin}
        size={size}
        color={color}
        InputProps={{
          startAdornment: startIcon ? (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ) : null,
          endAdornment: endIcon ? (
            <InputAdornment position="end">{endIcon}</InputAdornment>
          ) : null,
          sx: {
            borderRadius: 1.5,
            '&.Mui-focused': {
              boxShadow: `0px 0px 0px 3px ${theme.palette[color || 'primary'].main}22`,
            },
          },
        }}
        InputLabelProps={{
          shrink: Boolean(value) || Boolean(placeholder),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5,
          },
          ...sx,
        }}
        {...props}
      />
    </Box>
  );

  // Apply animation if requested
  if (animation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: animationDelay }}
      >
        {inputContent}
      </motion.div>
    );
  }

  return inputContent;
};

export default FormInput; 