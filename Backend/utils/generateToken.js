import jwt from 'jsonwebtoken';

const generateToken = (id, email, role) => {
    return jwt.sign(
        { id, email, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

export default generateToken;