const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        
        // Use a direct MongoDB connection string that works locally or an in-memory database
        let connected = false;
        
        // First try to connect to a local MongoDB if available
        try {
            let mongoURI = 'mongodb+srv://preowned_db:JLSCsesiZ5HsUURh@preowned-cluster.j8zn6qm.mongodb.net/preowned-marketplace?retryWrites=true&w=majority&appName=preowned-cluster';
            console.log('Trying local MongoDB connection:', mongoURI);
            
            // Try local connection first with a short timeout
            await mongoose.connect(mongoURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 2000 // Short timeout for local connection
            });
            
            console.log(`MongoDB Connected locally: ${mongoose.connection.host}`);
            connected = true;
        } catch (localError) {
            console.log('Local MongoDB connection failed:', localError.message);
            console.log('Falling back to in-memory MongoDB...');
            
            // If local connection fails, use MongoDB in-memory for development
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            console.log('Using in-memory MongoDB URI:', uri);
            
            await mongoose.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            
            console.log('Connected to in-memory MongoDB');
            connected = true;
        }
        
        // Check connection state
        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB connection state: Connected');
        } else {
            console.log('MongoDB connection state:', mongoose.connection.readyState);
        }
        
        // Print out some debug info about the connection
        console.log('Connection details:', {
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name
        });
        
        // Set up connection error handlers
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
        
        return connected;
    } catch (err) {
        console.error(`MongoDB Connection Error: ${err.message}`);
        return false;
    }
};

module.exports = connectDB; 
