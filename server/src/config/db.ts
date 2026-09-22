import mongoose from 'mongoose';
import { env } from './env.js';

let mongodInstance: any = null;

export async function connectDB(): Promise<void> {
  try {
    // Set strictQuery
    mongoose.set('strictQuery', false);

    // Try primary connection
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] Connected to MongoDB at: ${env.MONGODB_URI}`);
  } catch (primaryErr) {
    console.warn('[Database] Native MongoDB connection failed. Booting embedded In-Memory MongoDB for local development...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Connected to In-Memory MongoDB at: ${inMemoryUri}`);
    } catch (fallbackErr) {
      console.error('[Database] Critical: Failed to connect to MongoDB:', fallbackErr);
      throw fallbackErr;
    }
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}
