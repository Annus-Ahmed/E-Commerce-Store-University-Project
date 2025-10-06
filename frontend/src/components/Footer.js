import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  IconButton, 
  TextField, 
  Button, 
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  LinkedIn, 
  Email, 
  Phone, 
  LocationOn, 
  Copyright,
  ArrowForward
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [email, setEmail] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with ${email}!`);
      setEmail('');
    }
  };
  
  const openPolicyDialog = (title, content) => {
    setDialogTitle(title);
    setDialogContent(content);
    setOpenDialog(true);
  };
  
  const privacyPolicyContent = `
# Privacy Policy

## Introduction
At PreOwned Marketplace, we respect your privacy and are committed to protecting your personal data. This Privacy Policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.

## What Data We Collect
We may collect, use, store and transfer different kinds of personal data about you:
- Identity Data: first name, last name, username
- Contact Data: email address, telephone number, address
- Technical Data: IP address, browser type, location
- Profile Data: purchases, preferences, feedback
- Usage Data: information about how you use our website and services

## How We Use Your Data
We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
- To register you as a new customer
- To process and deliver your orders
- To manage our relationship with you
- To improve our website, products/services, marketing
- To recommend products or services that may interest you

## Data Security
We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.

## Your Legal Rights
Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
- Request access to your personal data
- Request correction of your personal data
- Request erasure of your personal data
- Object to processing of your personal data
- Request restriction of processing your personal data
- Request transfer of your personal data
- Right to withdraw consent

## Contact Us
If you have any questions about this Privacy Policy, please contact us at privacy@preowned.example.com
  `;
  
  const termsOfServiceContent = `
# Terms of Service

## Introduction
These Terms of Service ("Terms") govern your access to and use of the PreOwned Marketplace platform. Please read these Terms carefully before using our services.

## User Accounts
When you create an account with us, you must provide accurate, complete, and up-to-date information. You are responsible for safeguarding your account credentials and for all activities that occur under your account.

## User Content
You retain ownership of any content you post on our platform, but grant us a license to use, store, and display that content in connection with providing our services.

## Prohibited Activities
You may not use our services for any illegal or unauthorized purpose, including:
- Posting fraudulent listings
- Harassing other users
- Circumventing security features
- Distributing malware
- Collecting user information without consent

## Fees and Payments
Some aspects of our service may require payment of fees. You agree to pay all applicable fees and taxes associated with your use of our services.

## Termination
We may terminate or suspend your account at any time for any reason, including violation of these Terms.

## Disclaimers
Our services are provided "as is" without warranties of any kind, either express or implied.

## Limitation of Liability
In no event shall PreOwned Marketplace be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of our services.

## Governing Law
These Terms shall be governed by the laws of [Your Jurisdiction], without regard to its conflict of law provisions.

## Changes to Terms
We may modify these Terms at any time. Your continued use of our services following such modifications constitutes your acceptance of the modified Terms.
  `;
  
  const faqContent = `
# Frequently Asked Questions

## General Questions

### What is PreOwned Marketplace?
PreOwned Marketplace is an online platform that connects buyers and sellers of pre-owned goods, allowing people to buy and sell used items in a safe, secure environment.

### How do I create an account?
Click on the "Register" button in the top right corner, fill in your details, and choose if you want to be a buyer, seller, or both.

### Is it free to use PreOwned Marketplace?
Basic accounts are free. Sellers may be charged a small commission fee on completed sales.

## For Buyers

### How do I find items?
Use the search bar at the top of the page or browse categories. You can filter results by price, condition, location, and more.

### How do I pay for items?
We support various payment methods including credit/debit cards, bank transfers, and cash on delivery for local pickups.

### What if I receive an item that doesn't match the description?
Contact the seller first. If you can't resolve the issue, you can open a dispute through our resolution center.

## For Sellers

### How do I list an item for sale?
Click on "Sell" in the navigation bar, fill in the item details, upload photos, set your price, and publish your listing.

### How long will my listing be active?
Standard listings remain active for 60 days. Premium listings (paid) can remain active for longer periods.

### When will I receive payment for sold items?
For online payments, funds are typically available 3-5 business days after the buyer confirms receipt of the item.

## Account Management

### How do I change my password?
Go to your Profile page, click on "Security Settings," and follow the instructions to change your password.

### Can I have both a buyer and seller account?
Yes, you can use the same account for both buying and selling by selecting the "both" option during registration.

### How do I delete my account?
Go to your Profile page, click on "Account Settings," and select "Delete Account." Please note that this action is irreversible.
  `;
  
  const aboutUsContent = `
# About PreOwned Marketplace

## Our Mission
At PreOwned Marketplace, we believe in extending the lifecycle of products through responsible reselling. Our mission is to create a sustainable, trusted platform where people can buy and sell pre-owned goods, reducing waste and providing value to our community.

## Our Story
Founded in 2023, PreOwned Marketplace began as a small project with a big vision: to transform how people think about used goods. What started as a local community initiative has grown into a comprehensive platform serving thousands of users.

## Our Values
- **Sustainability**: We're committed to reducing waste by extending the life of products
- **Trust**: We prioritize creating a safe, transparent marketplace for all users
- **Community**: We believe in the power of connecting people through commerce
- **Innovation**: We continuously improve our platform to better serve our users

## Our Team
Our diverse team brings together expertise in e-commerce, technology, customer service, and sustainability. We're united by our passion for creating a marketplace that benefits both people and the planet.

## Join Us
Whether you're looking to declutter your home, find unique items at great prices, or join a community that values sustainability, PreOwned Marketplace welcomes you.
  `;

  return (
    <Box 
      component="footer" 
      sx={{
        bgcolor: 'background.paper',
        py: 3,
        borderTop: 1,
        borderColor: 'divider',
        mt: 4,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.03)'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          {/* Company Information */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="bold">
              PRE-OWNED GOODS
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Quality items, great prices, sustainable future.
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
              <IconButton color="primary" aria-label="Facebook" size="small" sx={{ p: 0.5 }}>
                <Facebook fontSize="small" />
              </IconButton>
              <IconButton color="primary" aria-label="Twitter" size="small" sx={{ p: 0.5 }}>
                <Twitter fontSize="small" />
              </IconButton>
              <IconButton color="primary" aria-label="Instagram" size="small" sx={{ p: 0.5 }}>
                <Instagram fontSize="small" />
              </IconButton>
              <IconButton color="primary" aria-label="LinkedIn" size="small" sx={{ p: 0.5 }}>
                <LinkedIn fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
          
          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="textPrimary" gutterBottom fontWeight="bold">
              Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Link 
                  component={RouterLink} 
                  to="/products" 
                  color="inherit" 
                  underline="hover"
                  sx={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.85rem' }}
                >
                  <ArrowForward sx={{ fontSize: 10, mr: 0.5 }} />
                  Browse Products
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Link 
                  component="button"
                  color="inherit" 
                  underline="hover"
                  sx={{ 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    p: 0,
                    font: 'inherit',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => openPolicyDialog('About Us', aboutUsContent)}
                >
                  <ArrowForward sx={{ fontSize: 10, mr: 0.5 }} />
                  About Us
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Link 
                  component="button"
                  color="inherit" 
                  underline="hover"
                  sx={{ 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    p: 0,
                    font: 'inherit',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => openPolicyDialog('FAQs', faqContent)}
                >
                  <ArrowForward sx={{ fontSize: 10, mr: 0.5 }} />
                  FAQs
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Link 
                  component="button"
                  color="inherit" 
                  underline="hover"
                  sx={{ 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    p: 0,
                    font: 'inherit',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => openPolicyDialog('Terms of Service', termsOfServiceContent)}
                >
                  <ArrowForward sx={{ fontSize: 10, mr: 0.5 }} />
                  Terms of Service
                </Link>
              </Box>
              <Box component="li">
                <Link 
                  component="button"
                  color="inherit" 
                  underline="hover"
                  sx={{ 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    p: 0,
                    font: 'inherit',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => openPolicyDialog('Privacy Policy', privacyPolicyContent)}
                >
                  <ArrowForward sx={{ fontSize: 10, mr: 0.5 }} />
                  Privacy Policy
                </Link>
              </Box>
            </Box>
          </Grid>
          
          {/* Contact Information */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="textPrimary" gutterBottom fontWeight="bold">
              Contact Us
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <LocationOn color="primary" sx={{ mr: 0.5, fontSize: 16, mt: 0.3 }} />
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  123 Market Street, City Center, NY 10001
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Phone color="primary" sx={{ mr: 0.5, fontSize: 16 }} />
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email color="primary" sx={{ mr: 0.5, fontSize: 16 }} />
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  support@preowned.example.com
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Newsletter */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" color="textPrimary" gutterBottom fontWeight="bold">
              Stay Updated
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mb: 1 }}>
              Subscribe for updates and offers.
            </Typography>
            <Box component="form" onSubmit={handleSubscribe} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Email Address"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    height: 32,
                    fontSize: '0.85rem'
                  }
                }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                size="small"
                sx={{ 
                  height: 32,
                  minWidth: 'auto',
                  px: 2,
                  fontSize: '0.75rem'
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Copyright Section */}
        <Box sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'space-between', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', textAlign: isMobile ? 'center' : 'left' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', mb: isMobile ? 1 : 0 }}>
            <Copyright sx={{ fontSize: 12, mr: 0.5 }} />
            {new Date().getFullYear()} PreOwned Marketplace. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Link color="inherit" underline="hover" component="button" variant="caption">
              Sitemap
            </Link>
            <Link color="inherit" underline="hover" component="button" variant="caption">
              Cookies
            </Link>
            <Link color="inherit" underline="hover" component="button" variant="caption">
              Accessibility
            </Link>
          </Box>
        </Box>
      </Container>
      
      {/* Policy Dialogs */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        scroll="paper"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent dividers>
          <Typography
            component="div"
            sx={{
              '& h1': { 
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                mb: 2
              },
              '& h2': { 
                fontSize: '1.4rem',
                fontWeight: 'bold',
                color: theme.palette.text.primary,
                mt: 3,
                mb: 2
              },
              '& h3': { 
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: theme.palette.text.primary,
                mt: 2,
                mb: 1 
              },
              '& p': { mb: 1.5 },
              '& ul, & ol': { pl: 2, mb: 2 },
              '& li': { mb: 0.5 },
              whiteSpace: 'pre-line'
            }}
          >
            {dialogContent}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Footer; 