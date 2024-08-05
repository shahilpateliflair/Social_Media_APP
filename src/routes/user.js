const jwt = require('jsonwebtoken');
const { userModel } = require('../models/login');

const JWT_SECRET = 'your_jwt_secret';

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - Missing token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        // Fetch user from database based on userId
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.active = Date.now() < decoded.exp * 1000;
        await user.save();

          req.userId = userId; // Attach userId to request for further processing
        req.user = user; // Attach user object to request (optional)

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Token verification error:', error);


        return res.status(403).json({ message: 'Forbidden - Invalid token' });
    }
};

module.exports = authenticateToken;




