import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null
    };
}

async function connectToDatabase() {
    console.log('[DB] connectToDatabase called'); // Log when the function is called

    if (cached.conn) {
        console.log('[DB] Using cached connection'); // Log if using cached connection
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        console.log('[DB] Creating new connection promise'); // Log when creating a new promise

        cached.promise = mongoose.connect(MONGODB_URI as string, opts).then( (mongoose) => {
            console.log('[DB] MongoDB connection successful'); // Log on successful connection
            return mongoose;
        }).catch(err => {
            console.error('[DB] MongoDB connection error:', err); // Log any connection errors
            throw err; // Re-throw the error to prevent silent failures
        });
    }

    cached.conn = await cached.promise;
    console.log('[DB] Connection established or retrieved'); // Log after connection is established
    return cached.conn;
}

export default connectToDatabase;