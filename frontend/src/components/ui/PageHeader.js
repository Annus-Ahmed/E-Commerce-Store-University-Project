import React from 'react';
import { Box, Typography, Divider, Breadcrumbs, Link, useTheme, useMediaQuery } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const PageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  action,
  marginBottom = 4
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        mb: marginBottom,
        position: 'relative',
      }}
    >
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{ mb: 2, color: theme.palette.text.secondary }}
        >
          {breadcrumbs.map((crumb, index) => (
            crumb.to ? (
              <Link
                key={index}
                component={RouterLink}
                to={crumb.to}
                underline="hover"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {crumb.icon && (
                  <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                    {crumb.icon}
                  </Box>
                )}
                {crumb.label}
              </Link>
            ) : (
              <Typography
                key={index}
                color="text.primary"
                sx={{ display: 'flex', alignItems: 'center', fontWeight: 'medium' }}
              >
                {crumb.icon && (
                  <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                    {crumb.icon}
                  </Box>
                )}
                {crumb.label}
              </Typography>
            )
          ))}
        </Breadcrumbs>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              component="h1"
              fontWeight="bold"
              color="text.primary"
            >
              {title}
            </Typography>
          </motion.div>

          {subtitle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {subtitle}
              </Typography>
            </motion.div>
          )}
        </Box>

        {action && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {action}
          </motion.div>
        )}
      </Box>

      <Divider sx={{ mt: 2, mb: 3 }} />
    </Box>
  );
};

export default PageHeader; 