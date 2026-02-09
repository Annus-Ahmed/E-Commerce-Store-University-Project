const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = 'mongodb+srv://preowned_db:JLSCsesiZ5HsUURh@preowned-cluster.j8zn6qm.mongodb.net/preowned-marketplace?retryWrites=true&w=majority&appName=preowned-cluster';
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        
        console.log('MongoDB Atlas Connected:', mongoose.connection.host);
        
        mongoose.connection.on('error', err => {
            console.error('MongoDB error:', err);
        });
        
        return true;
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        return false;
    }
};

module.exports = connectDB; 
