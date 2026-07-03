import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Ensure the key is exactly 32 bytes (64 hex characters)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : crypto.randomBytes(32);

export function encrypt(text: string): string {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format: iv:authTag:encryptedText
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw error;
  }
}

export function decrypt(encryptedData: string): string {
  if (!encryptedData) return encryptedData;
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) return encryptedData; // Might be unencrypted legacy data
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = Buffer.from(parts[2], 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    // If decryption fails, it might be legacy unencrypted data, return as is (or throw, depending on strictness)
    return encryptedData; 
  }
}
