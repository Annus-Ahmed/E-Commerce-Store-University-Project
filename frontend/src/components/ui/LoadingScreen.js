import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingScreen = ({ 
  message = 'Loading...', 
  size = 60, 
  height = '100vh',
  fullScreen = true,
  showMessage = true,
  color = 'primary'
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: height,
        width: '100%',
        position: fullScreen ? 'fixed' : 'relative',
        top: fullScreen ? 0 : 'auto',
        left: fullScreen ? 0 : 'auto',
        right: fullScreen ? 0 : 'auto',
        bottom: fullScreen ? 0 : 'auto',
        zIndex: fullScreen ? theme.zIndex.modal + 1 : 1,
        backgroundColor: fullScreen ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
        backdropFilter: fullScreen ? 'blur(5px)' : 'none',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <CircularProgress 
          size={size} 
          color={color} 
          thickness={4}
          sx={{ 
            boxShadow: fullScreen ? '0 0 30px rgba(0,0,0,0.1)' : 'none',
            borderRadius: '50%',
            p: 1,
            backgroundColor: fullScreen ? 'white' : 'transparent',
          }}
        />
      </motion.div>
      
      {showMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              mt: 3,
              fontWeight: 500,
              textAlign: 'center',
              maxWidth: 250,
            }}
          >
            {message}
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default LoadingScreen; 