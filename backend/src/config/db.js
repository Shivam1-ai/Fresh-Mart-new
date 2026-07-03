import mongoose from 'mongoose';

const defaultLocalMongoUri = 'mongodb://127.0.0.1:27017/freshmart';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const localMongoUri = process.env.LOCAL_MONGO_URI || defaultLocalMongoUri;

  try {
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined');
    }

    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    const canUseLocalFallback = process.env.NODE_ENV !== 'production' && localMongoUri;

    if (canUseLocalFallback) {
      console.warn(`MongoDB Atlas connection failed: ${error.message}`);
      console.warn(`Using local MongoDB fallback: ${localMongoUri}`);

      try {
        const conn = await mongoose.connect(localMongoUri, {
          serverSelectionTimeoutMS: 5000,
          maxPoolSize: 10
        });

        console.log(`MongoDB connected: ${conn.connection.host}`);
        return;
      } catch (fallbackError) {
        console.error(`Local MongoDB fallback failed: ${fallbackError.message}`);
      }
    }

    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
