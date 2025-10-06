import React from 'react';
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Map of type to icon
const typeToIcon = {
  'search': <SearchOffIcon sx={{ fontSize: 64 }} />,
  'products': <InventoryIcon sx={{ fontSize: 64 }} />,
  'cart': <ShoppingCartIcon sx={{ fontSize: 64 }} />,
  'default': <SentimentDissatisfiedIcon sx={{ fontSize: 64 }} />
};

const EmptyState = ({
  type = 'default',
  title = 'No results found',
  message = 'We couldn\'t find any items matching your criteria.',
  action,
  actionText = 'Try Again',
  actionIcon,
  onAction,
  elevation = 1,
  customIcon,
  animate = true
}) => {
  const theme = useTheme();
  
  // Determine which icon to display
  const displayIcon = customIcon || typeToIcon[type] || typeToIcon.default;
  
  const content = (
    <Paper
      elevation={elevation}
      sx={{
        py: 6,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        border: `1px dashed ${theme.palette.divider}`
      }}
    >
      <Box 
        sx={{ 
          color: 'text.secondary',
          mb: 3,
          p: 2,
          borderRadius: '50%',
          backgroundColor: `${theme.palette.primary.main}10`
        }}
      >
        {displayIcon}
      </Box>
      
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom
        fontWeight="bold"
        color="text.primary"
      >
        {title}
      </Typography>
      
      <Typography 
        variant="body1" 
        color="text.secondary"
        sx={{ maxWidth: 450, mb: action ? 4 : 0 }}
      >
        {message}
      </Typography>
      
      {action && (
        <Button
          variant="contained"
          color="primary"
          startIcon={actionIcon}
          onClick={onAction}
          sx={{ mt: 2 }}
        >
          {actionText}
        </Button>
      )}
    </Paper>
  );
  
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {content}
      </motion.div>
    );
  }
  
  return content;
};

export default EmptyState; 