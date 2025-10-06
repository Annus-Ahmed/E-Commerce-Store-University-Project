import React from 'react';
import { Paper, Box, Typography, Divider, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

const SectionContainer = ({
  title,
  subtitle,
  icon,
  children,
  action,
  elevation = 1,
  padding = { xs: 2, sm: 3, md: 4 },
  marginBottom = 4,
  animate = true,
  divider = true,
  fullHeight = false,
  noPadding = false,
  background = 'white',
  titleVariant = 'h5',
  maxWidth,
  sx = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const content = (
    <Paper
      elevation={elevation}
      sx={{
        borderRadius: 2,
        mb: marginBottom,
        height: fullHeight ? '100%' : 'auto',
        overflow: 'hidden',
        backgroundColor: background,
        ...sx,
      }}
    >
      {(title || action) && (
        <Box
          sx={{
            px: noPadding ? 0 : padding,
            py: 2,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? 2 : 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {icon && (
              <Box sx={{ mr: 1.5, color: theme.palette.primary.main }}>
                {icon}
              </Box>
            )}
            <Box>
              <Typography
                variant={titleVariant}
                component="h2"
                fontWeight="bold"
                color="text.primary"
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {action && <Box>{action}</Box>}
        </Box>
      )}

      {divider && <Divider />}

      <Box
        sx={{
          px: noPadding ? 0 : padding,
          py: noPadding ? 0 : { xs: 2, sm: 3 },
          maxWidth,
        }}
      >
        {children}
      </Box>
    </Paper>
  );

  // Apply animation if requested
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

export default SectionContainer; 