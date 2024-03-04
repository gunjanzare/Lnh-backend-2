import * as crypto from 'crypto';
export const algorithm = 'aes-256-ctr';
// UUID is to make sure tokens are encrypted in case of some failure to provide a password. 
// DO NOT USE THIS IN PRODUCTION. This will cause breakdown in communication between services, especially in containerized environments.
export const JWT_SIGNING_SECRET = process.env.JWT_SIGNING_SECRET || crypto.randomBytes(32).toString('hex');
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
export const IV_LENGTH = 16;