import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { ENCRYPTION_KEY, IV_LENGTH, algorithm } from '../configs/secrets';

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

// Function to compare password with its hash
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}


export const encrypt = (text: string): string => {
    console.log( "\nENCRYPTION_KEY:", ENCRYPTION_KEY)
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (text: string): string => {
    let textParts = text.split(':');
    let shifted = textParts.shift();
    if (typeof shifted !== 'string') {
        throw new Error('Invalid encrypted text format');
    }
    let iv = Buffer.from(shifted, 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};
