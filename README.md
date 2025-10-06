# Pre-Owned Marketplace Application

A full-stack web application for buying and selling pre-owned items. This platform allows users to register, list items for sale, browse products, and communicate with sellers.

## Features

1. **User Registration and Profiles**
   - User registration with basic information
   - User login with authentication
   - User profiles with listing history

2. **Product Listing**
   - Sellers can upload products with descriptions, images, and pricing
   - Categories and tags for easy classification
   - Multiple image upload support

3. **Search and Filters**
   - Search by keywords, category, price range, location, and condition
   - Advanced filtering options
   - Sort by various criteria

4. **Product Pages**
   - Detailed product information
   - Seller details and contact options
   - Purchase options

5. **Additional Features**
   - Admin dashboard for platform management
   - Messaging system between buyers and sellers
   - Order history and tracking
   - Wishlist functionality

## Technical Stack

- **Frontend**: React, Material-UI, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js v14+ and npm
- MongoDB (local installation or MongoDB Atlas account)

## Installation

### Easy Setup (Recommended)

1. Clone the repository
   ```
   git clone https://github.com/yourusername/pre-owned-marketplace.git
   cd pre-owned-marketplace
   ```

2. Run the setup script
   ```
   node setup.js
   ```
   This script will:
   - Create necessary directories
   - Check for MongoDB installation
   - Install dependencies
   - Provide further instructions

### Manual Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/pre-owned-marketplace.git
   cd pre-owned-marketplace
   ```

2. Install backend dependencies
   ```
   cd backend
   npm install
   ```

3. Create uploads directory (if it doesn't exist)
   ```
   mkdir -p uploads
   ```

4. Install frontend dependencies
   ```
   cd ../frontend
   npm install
   ```

5. Set up MongoDB
   - Option 1: Use MongoDB Atlas (cloud)
     - Update the connection string in `backend/config/db.js`
   - Option 2: Use local MongoDB
     - Make sure MongoDB is installed and running
     - Create a data directory: `mkdir -p ../data`

## Running the Application

1. Start MongoDB (if using local installation)
   ```
   mongod --dbpath=./data
   ```

2. Start the backend server
   ```
   cd backend
   npm start
   ```

3. Start the frontend in a new terminal
   ```
   cd frontend
   npm start
   ```

4. Access the application at http://localhost:3000

## Default Admin Access

- Email: admin@example.com
- Password: admin123

## Database Connection Issues

If you're experiencing registration or login issues due to database connection problems:

1. The application is configured to use MongoDB Atlas as a fallback
2. Make sure your internet connection is working
3. If using local MongoDB:
   - Verify MongoDB is running: `mongod --dbpath=./data`
   - Check MongoDB logs for any errors

## Troubleshooting

- **Network Error**: Ensure both frontend and backend servers are running
- **Upload Issues**: Verify the uploads directory exists in the backend folder
- **Registration Fails**: Check MongoDB connection and console errors

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Images sourced from Unsplash
- Icons from Material-UI
- Demo data created for testing purposes 