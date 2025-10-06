import React from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import Navbar from '../Navbar';
import Footer from '../Footer';

const MainLayout = ({ children, maxWidth = 'lg', disablePadding = false, hideFooter = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: theme.palette.background.default,
      }}
    >
      <Navbar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          pt: { xs: 2, sm: 3, md: 4 },
          pb: hideFooter ? 0 : { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Container 
          maxWidth={maxWidth} 
          sx={{ 
            px: disablePadding ? 0 : { xs: 2, sm: 3 },
            height: '100%',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </Container>
      </Box>
      {!hideFooter && <Footer />}
    </Box>
  );
};

export default MainLayout; 