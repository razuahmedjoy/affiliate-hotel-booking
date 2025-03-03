import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

// Export the environment variables
export const config = {
    PORT: process.env.PORT,
    ENV: process.env.NODE_ENV || 'development',
    TOKEN: {
        SECRET: process.env.TOKEN_SECRET,
        EXPIRES_IN: process.env.TOKEN_SECRET_EXPIRES_IN,
    },
    BCRYPT: {
        SALT_ROUND: process.env.BCRYPT_SALT_ROUND,
    },
    DATABASE: {
        MONGO_URI: process.env.MONGO_URI,
        NAME: process.env.DATABASE_NAME,
    },
    MAIL: {
        SENDER_EMAIL_ID: process.env.SENDER_EMAIL_ID,
        SENDER_EMAIL_PASSWORD: process.env.SENDER_EMAIL_PASSWORD,
        SENDER_EMAIL_HOSTNAME: process.env.SENDER_EMAIL_HOSTNAME,
        SENDER_EMAIL_PORT: process.env.SENDER_EMAIL_PORT,
    }
};