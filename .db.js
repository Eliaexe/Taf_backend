import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Carica le variabili d'ambiente

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in .env file');
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    process.exit(1); // Termina il processo in caso di errore
  }
};

export default connectDB;
