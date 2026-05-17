import { MongoClient, Db } from 'mongodb';

const options = {};

let cachedDb: Db | null = null;
let clientPromise: Promise<MongoClient> | undefined;

/**
 * Returns a connection to the ColorWall DB to perform queries.
 */
export async function getDb(): Promise<Db> {
    if (cachedDb) return cachedDb;

    const uri = process.env.MONGODB_URI as string;
    if (!uri) {
        throw new Error('Please add your Mongo URI to .env.local');
    }

    if (process.env.NODE_ENV === 'development') {
        let globalWithMongo = global as typeof globalThis & {
            _mongoClientPromise?: Promise<MongoClient>;
        };

        if (!globalWithMongo._mongoClientPromise) {
            const client = new MongoClient(uri, options);
            globalWithMongo._mongoClientPromise = client.connect();
        }
        clientPromise = globalWithMongo._mongoClientPromise;
    } else {
        if (!clientPromise) {
            const client = new MongoClient(uri, options);
            clientPromise = client.connect();
        }
    }

    const connectedClient = await clientPromise;
    
    // We can define a hardcoded database name like 'ColorWall' so it doesn't default to 'test'
    // if not specified in the URI.
    cachedDb = connectedClient.db('ColorWall');

    // ensure indexes exist
    try {
        await cachedDb.collection('rateLimits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
        // index for fast sorted pagination on the feedback listing
        await cachedDb.collection('feedback').createIndex({ createdAt: -1 });
    } catch (e) {
        // ignore silent index creation failures in serverless environments
    }

    return cachedDb;
}
