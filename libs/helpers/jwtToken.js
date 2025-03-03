import jwt from 'jsonwebtoken'
import { config } from '../../config/server/config.js';

// generate token
export const generateToken = (data) => {

    const payload = { id: data.id };

    // token generating
    const token = jwt.sign(
        payload,
        config.TOKEN.SECRET,
        { expiresIn: config.TOKEN.EXPIRES_IN }
    );

    return token;
};

// verify token
export const verifyToken = (token, secret) => {
    return jwt.verify(token, secret);
};