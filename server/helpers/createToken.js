import jwt from 'jsonwebtoken';
const tokenExpire = 3 * 24 * 60 * 60; // 3days
const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: tokenExpire });
}

export default createToken;