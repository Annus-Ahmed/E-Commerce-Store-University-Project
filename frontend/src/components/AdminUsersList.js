import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Avatar,
  Chip,
  Tooltip,
  InputAdornment,
  IconButton
} from '@mui/material';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const AdminUsersList = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/users?page=${page + 1}&limit=${rowsPerPage}`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      if (roleFilter) {
        url += `&role=${encodeURIComponent(roleFilter)}`;
      }
      
      const response = await axios.get(url);
      setUsers(response.data.users);
      setTotalUsers(response.data.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);
  
  // Effect for role filter changes
  useEffect(() => {
    setPage(0); // Reset to first page when filter changes
    fetchUsers();
  }, [roleFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = () => {
    setSearchLoading(true);
    setPage(0);
    fetchUsers();
  };
  
  const clearSearch = () => {
    setSearch('');
    if (search) {
      setPage(0);
      setSearchLoading(true);
      setTimeout(() => fetchUsers(), 0);
    }
  };

  const handleOpenRoleDialog = (user) => {
    if (user.role === 'admin') {
      return;
    }
    
    setSelectedUser(user);
    setNewRole(user.role);
    setOpenRoleDialog(true);
  };

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
    setSelectedUser(null);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    
    setUserActionLoading(true);
    try {
      const response = await axios.patch(`/api/admin/users/${selectedUser._id}/role`, {
        role: newRole
      });
      
      console.log('Role updated successfully:', response.data);
      
      // Update user in the list
      setUsers(users.map(user => 
        user._id === selectedUser._id 
          ? { ...user, role: newRole } 
          : user
      ));
      
      // Fetch updated user list to ensure consistency
      fetchUsers();
      
      handleCloseRoleDialog();
    } catch (error) {
      console.error('Error updating user role:', error);
      // Show error message
      alert(`Error updating role: ${error.response?.data?.message || 'Unknown error'}`);
    } finally {
      setUserActionLoading(false);
    }
  };

  const getRoleChipColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'seller':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserInitials = (name) => {
    if (!name) return '?';
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        User Management
      </Typography>
      
      <Box sx={{ display: 'flex', mb: 3, gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        <TextField
          label="Search by name or email"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label="clear search"
                  onClick={clearSearch}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={searchLoading}
          startIcon={searchLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
        >
          {searchLoading ? 'Searching...' : 'Search'}
        </Button>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="role-filter-label">Role</InputLabel>
          <Select
            labelId="role-filter-label"
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            label="Role"
            startAdornment={<FilterAltIcon sx={{ ml: -0.5, mr: 0.5, color: 'primary.main' }} />}
          >
            <MenuItem value="">
              <em>All Roles</em>
            </MenuItem>
            <MenuItem value="buyer">Buyers</MenuItem>
            <MenuItem value="seller">Sellers</MenuItem>
            <MenuItem value="admin">Admins</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  {search || roleFilter ? 
                    'No users found matching your search criteria' : 
                    'No users found'}
                </TableCell>
              </TableRow>
            ) :
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {user.profileImage ? (
                        <Avatar 
                          src={user.profileImage} 
                          alt={user.name} 
                          sx={{ mr: 2 }}
                        />
                      ) : (
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getUserInitials(user.name)}
                        </Avatar>
                      )}
                      <Typography variant="body2">{user.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                        color={getRoleChipColor(user.role)}
                        size="small"
                      />
                      {user.role === 'admin' && (
                        <Tooltip title="Protected Admin Account" arrow>
                          <SecurityIcon 
                            fontSize="small" 
                            color="error" 
                            sx={{ ml: 1 }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    {user.role === 'admin' ? (
                      <Tooltip title="Admin accounts are protected and cannot be modified" arrow>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LockIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            Protected
                          </Typography>
                        </Box>
                      </Tooltip>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenRoleDialog(user)}
                      >
                        Change Role
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Change Role Dialog */}
      <Dialog open={openRoleDialog} onClose={handleCloseRoleDialog}>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select a new role for {selectedUser?.name}:
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="new-role-label">Role</InputLabel>
            <Select
              labelId="new-role-label"
              id="new-role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              label="Role"
            >
              <MenuItem value="buyer">Buyer</MenuItem>
              <MenuItem value="seller">Seller</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog} disabled={userActionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleRoleChange} 
            variant="contained" 
            disabled={userActionLoading}
          >
            {userActionLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsersList; 