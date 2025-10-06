import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  Typography, 
  Menu, 
  Container, 
  Avatar, 
  Button, 
  Tooltip, 
  MenuItem,
  useTheme,
  useMediaQuery,
  Badge,
  InputBase,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  ShoppingBag, 
  AccountCircle, 
  Logout,
  AddCircleOutline,
  Dashboard,
  Email,
  Person,
  Add,
  Store,
  Message,
  Search as SearchIcon,
  Close,
  More as MoreIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { styled, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Custom styled components for the navbar
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  borderBottom: '1px solid',
  borderColor: alpha(theme.palette.divider, 0.1),
  zIndex: theme.zIndex.drawer + 1,
  transition: 'all 0.3s ease'
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '12px',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  border: '1px solid',
  borderColor: alpha(theme.palette.divider, 0.15),
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  transition: 'all 0.3s ease'
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    fontWeight: 'bold',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(0.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Debug - log user info
  useEffect(() => {
    console.log('Navbar - Current user:', user);
    if (user) {
      console.log('User role:', user.role);
      console.log('Is admin?', user.role === 'admin');
    }
  }, [user]);
  
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Remove message functionality - no longer needed

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleCloseNavMenu();
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    if (event.key === 'Enter') {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  const handleMobileSearchToggle = () => {
    setShowSearch(!showSearch);
  };

  // Generate user's initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.name) return '?';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate a consistent color based on the user's name
  const getAvatarColor = () => {
    if (!user || !user.name) return theme.palette.primary.main;
    
    const colors = [
      '#1E88E5', // blue
      '#43A047', // green
      '#E53935', // red
      '#FB8C00', // orange
      '#8E24AA', // purple
      '#00ACC1', // cyan
      '#3949AB', // indigo
      '#7CB342', // light green
      '#C0CA33', // lime
      '#FFB300', // amber
      '#F4511E', // deep orange
      '#6D4C41', // brown
    ];
    
    const hashCode = user.name.split('').reduce(
      (hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0
    );
    
    return colors[Math.abs(hashCode) % colors.length];
  };

  // Force show admin dashboard link for testing
  const isAdmin = user && (user.role === 'admin' || user.email === 'admin@example.com');

  const isMenuOpen = Boolean(anchorElNav);
  const isMobileMenuOpen = Boolean(anchorElUser);

  // Navigation links with proper icons
  const navLinks = [
    { title: 'Browse Products', path: '/products', icon: <ShoppingBag /> },
    { title: 'My Listings', path: '/listings', icon: <Store /> },
    { title: 'Sell an Item', path: '/list-item', icon: <Add /> }
  ];
  
  // Admin links
  const adminLinks = user && user.role === 'admin' ? [
    { title: 'Admin Dashboard', path: '/admin', icon: <Dashboard /> }
  ] : [];

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorElNav}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleCloseNavMenu}
      PaperProps={{
        elevation: 3,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
          mt: 1.5,
          borderRadius: '12px',
          minWidth: 180,
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
        },
      }}
    >
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {user?.name || 'User'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.email || ''}
        </Typography>
      </Box>
      <Divider />
      <MenuItem 
        component={Link} 
        to="/profile"
        onClick={handleCloseNavMenu}
        sx={{ py: 1.5 }}
      >
        <ListItemIcon>
          <Person fontSize="small" color="primary" />
        </ListItemIcon>
        <ListItemText 
          primary="My Profile" 
          primaryTypographyProps={{ variant: 'body2' }}
        />
      </MenuItem>
      
      <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
        <ListItemIcon>
          <Logout fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText 
          primary="Logout" 
          primaryTypographyProps={{ 
            variant: 'body2',
            color: 'error.main',
            fontWeight: 'medium'
          }}
        />
      </MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={anchorElNav}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      open={Boolean(anchorElNav)}
      onClose={handleCloseNavMenu}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiPaper-root': {
          borderRadius: '12px',
          mt: 1.5,
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        }
      }}
    >
      {navLinks.map((link) => (
        <MenuItem 
          key={link.path} 
          onClick={() => handleNavigate(link.path)}
          component={motion.div}
          whileHover={{ scale: 1.02, x: 2 }}
        >
          <ListItemIcon>{link.icon}</ListItemIcon>
          <ListItemText primary={link.title} />
        </MenuItem>
      ))}
      
      {adminLinks.map((link) => (
        <MenuItem 
          key={link.path} 
          onClick={() => handleNavigate(link.path)}
          sx={{ color: 'primary.main' }}
          component={motion.div}
          whileHover={{ scale: 1.02, x: 2 }}
        >
          <ListItemIcon sx={{ color: 'primary.main' }}>{link.icon}</ListItemIcon>
          <ListItemText primary={link.title} />
        </MenuItem>
      ))}
    </Menu>
  );

  // Desktop navigation
  const renderDesktopNav = (
    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 3 }}>
      {navLinks.map((link) => (
        <Button
          key={link.path}
          onClick={() => handleNavigate(link.path)}
          sx={{ 
            color: 'text.primary', 
            mx: 0.5,
            '&:hover': {
              color: 'primary.main',
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
            '&.active': {
              color: 'primary.main',
              fontWeight: 'bold',
            },
            display: 'flex',
            alignItems: 'center',
            borderRadius: '8px',
            px: 2,
            py: 1,
          }}
          startIcon={link.icon}
        >
          {link.title}
        </Button>
      ))}
      
      {adminLinks.map((link) => (
        <Button
          key={link.path}
          onClick={() => handleNavigate(link.path)}
          sx={{ 
            color: 'primary.main', 
            mx: 0.5, 
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
            display: 'flex',
            alignItems: 'center',
            borderRadius: '8px',
            px: 2,
          }}
          startIcon={link.icon}
        >
          {link.title}
        </Button>
      ))}
    </Box>
  );

  return (
    <StyledAppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo for larger screens */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'primary.main',
              textDecoration: 'none',
              alignItems: 'center',
            }}
          >
            PRE-OWNED GOODS
          </Typography>

          {/* Mobile menu icon */}
          <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            {renderMobileMenu}
          </Box>

          {/* Logo for mobile */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none' },
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
          </Typography>

          {/* Desktop navigation */}
          {renderDesktopNav}

          {/* Search Bar */}
          <Search style={{ minWidth: 250, background: '#fff', border: '1px solid #ccc' }}>
            <SearchIconWrapper>
              <SearchIcon style={{ color: '#888' }} />
            </SearchIconWrapper>
            <form onSubmit={handleSearchSubmit}>
              <StyledInputBase
                placeholder="Search items..."
                inputProps={{ 'aria-label': 'search' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ color: '#222' }}
              />
            </form>
          </Search>

          {/* User menu */}
          <Box sx={{ flexGrow: 0, ml: 1 }}>
            <Tooltip title="Account settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                {user?.profileImage ? (
                  <Avatar 
                    alt={user.name} 
                    src={user.profileImage} 
                    sx={{ width: 40, height: 40, border: `2px solid ${theme.palette.primary.main}` }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 40, 
                      height: 40,
                      bgcolor: getAvatarColor(),
                      color: '#fff',
                      fontWeight: 'bold',
                      border: `2px solid ${theme.palette.primary.main}`
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              PaperProps={{
                elevation: 3,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
                  mt: 1.5,
                  borderRadius: '12px',
                  minWidth: 180,
                },
              }}
            >
              <MenuItem onClick={() => { handleNavigate('/profile'); handleCloseUserMenu(); }}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="My Profile" />
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Navbar; 